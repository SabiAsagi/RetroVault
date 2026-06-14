import fs from 'fs';
import path from 'path';
import pg from 'pg';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const { Pool } = pg;

// 환경변수 확인
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!anthropicApiKey) {
  console.error("❌ 오류: ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.");
  process.exit(1);
}
if (!dbUrl) {
  console.error("❌ 오류: POSTGRES_PRISMA_URL 또는 DATABASE_URL이 설정되지 않았습니다.");
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey });
const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

// 테이블 설정
const TABLE_CONFIG = {
  platforms: {
    table: 'Platform',
    sourceColumns: ['id', 'name', 'manufacturer', 'description', 'specs', 'mediaFormat', 'specs_cpu', 'specs_gpu', 'specs_memory', 'peripherals'],
    targetColumns: ['name_ko', 'manufacturer_ko', 'description_ko', 'specs_ko', 'mediaFormat_ko', 'specs_cpu_ko', 'specs_gpu_ko', 'specs_memory_ko', 'peripherals_ko'],
    filterClause: `"name_ko" IS NULL`,
    promptTitle: 'Video Game Consoles (Platforms)',
    jsonSchema: {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name_ko": { "type": "string" },
          "manufacturer_ko": { "type": "string" },
          "description_ko": { "type": "string" },
          "specs_ko": { "type": "string", "description": "Translate or deduce general specs" },
          "specs_cpu_ko": { "type": "string", "description": "Translate or deduce CPU specs" },
          "specs_gpu_ko": { "type": "string", "description": "Translate or deduce GPU specs" },
          "specs_memory_ko": { "type": "string", "description": "Translate or deduce Memory specs" },
          "peripherals_ko": { "type": "string", "description": "Translate or deduce peripherals" },
          "mediaFormat_ko": { "type": "string", "description": "Translate or deduce media format" }
        },
        "required": ["id", "name_ko", "manufacturer_ko", "description_ko"]
      }
    }
  },
  companies: {
    table: 'Company',
    sourceColumns: ['id', 'name', 'country', 'description', 'companyStatus', 'flagshipFranchises', 'keyFigures', 'subsidiaries'],
    targetColumns: ['name_ko', 'country_ko', 'description_ko', 'companyStatus_ko', 'flagshipFranchises_ko', 'keyFigures_ko', 'subsidiaries_ko'],
    filterClause: `"name_ko" IS NULL`,
    promptTitle: 'Video Game Companies',
    jsonSchema: {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name_ko": { "type": "string" },
          "country_ko": { "type": "string" },
          "description_ko": { "type": "string" },
          "companyStatus_ko": { "type": "string" },
          "flagshipFranchises_ko": { "type": "string" },
          "keyFigures_ko": { "type": "string" },
          "subsidiaries_ko": { "type": "string" }
        },
        "required": ["id", "name_ko", "description_ko"]
      }
    }
  },
  genres: {
    table: 'Game',
    sourceColumns: ['id', 'title', 'genre'],
    targetColumns: ['genre_ko'],
    filterClause: `"genre_ko" IS NULL`,
    promptTitle: 'Video Game Genres',
    jsonSchema: {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "genre_ko": { "type": "string", "description": "Translate genre to Korean" }
        },
        "required": ["id", "genre_ko"]
      }
    }
  }
};

// 명령줄 인수 파싱
const args = process.argv.slice(2);
let targetTable = null;
let applyToDb = false;
let batchSize = 10;

for (const arg of args) {
  if (arg.startsWith('--table=')) {
    targetTable = arg.split('=')[1];
  } else if (arg === '--apply') {
    applyToDb = true;
  } else if (arg.startsWith('--batch=')) {
    batchSize = parseInt(arg.split('=')[1], 10) || 10;
  }
}

async function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

async function generateTranslation(config, batchItems) {
  const inputData = batchItems.map(item => {
    const data = {};
    for (const col of config.sourceColumns) {
      data[col] = item[col];
    }
    return data;
  });

  const prompt = `
Please translate and enrich the following ${config.promptTitle} for a Korean audience.
Provide accurate Korean translations for names, manufacturers, descriptions, and other requested fields.

Input JSON:
${JSON.stringify(inputData, null, 2)}

You must return ONLY a JSON array matching exactly this schema for the items, enclosed in a JSON array [ ... ]:
${JSON.stringify(config.jsonSchema, null, 2)}

Make sure to preserve the exact 'id' for each item. Do not wrap with markdown code blocks like \`\`\`json. Return pure JSON.
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.2,
    system: "You are a professional video game localization expert. Output pure valid JSON without any markdown formatting.",
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  let text = response.content[0].text.trim();
  // 마크다운 코드블록 제거
  if (text.startsWith('```json')) text = text.slice(7);
  if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  
  text = text.trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON 파싱 실패:", err.message);
    console.error("Raw response:", text);
    throw new Error("Invalid JSON response from Claude");
  }
}

async function processTable(tableName, config, outStream, apply) {
  console.log(`\n📦 [${tableName}] 번역 작업 시작...`);
  
  // 큰 따옴표로 묶어 대소문자 구분 방지 및 예약어 회피
  const query = `SELECT ${config.sourceColumns.map(c => `"${c}"`).join(', ')} FROM "${config.table}" WHERE ${config.filterClause} LIMIT 1000`;
  const result = await pool.query(query);
  
  const untranslated = result.rows;
  console.log(`[${tableName}] 번역이 필요한 항목 수: ${untranslated.length} 개 (최대 1000개 제한)`);

  for (let i = 0; i < untranslated.length; i += batchSize) {
    const batch = untranslated.slice(i, i + batchSize);
    console.log(`[${tableName}] Processing batch ${i / batchSize + 1} (${batch.length} items)...`);

    try {
      const translatedItems = await generateTranslation(config, batch);
      
      let sqlBatch = `\n-- Batch ${i / batchSize + 1} for ${tableName}\n`;
      
      for (const item of translatedItems) {
        if (!item.id) continue;
        
        const updates = [];
        for (const targetCol of config.targetColumns) {
          if (item[targetCol] !== undefined) {
            updates.push(`"${targetCol}" = ${await escapeSqlString(item[targetCol])}`);
          }
        }
        
        if (updates.length > 0) {
          const sql = `UPDATE "${config.table}" SET ${updates.join(', ')} WHERE "id" = '${item.id}';\n`;
          sqlBatch += sql;
          
          if (apply) {
            await pool.query(sql);
          }
        }
      }
      
      outStream.write(sqlBatch);
      console.log(`✅ Batch ${i / batchSize + 1} 완료!`);
      
      // Rate Limit 방지를 위한 대기 (Claude API Tier 제한 고려)
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (err) {
      console.error(`❌ Error processing batch:`, err.message);
      outStream.write(`\n-- ERROR processing batch ${i / batchSize + 1}: ${err.message}\n`);
    }
  }
}

async function main() {
  if (!targetTable && targetTable !== 'all') {
    console.log(`
사용법: 
node retrovault-translate.mjs --table=platforms
node retrovault-translate.mjs --table=companies
node retrovault-translate.mjs --table=genres
node retrovault-translate.mjs --table=all [--apply] [--batch=10]
    `);
    process.exit(0);
  }

  const outDir = path.join(process.cwd(), 'translation-output');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `translations-${timestamp}.sql`);
  const outStream = fs.createWriteStream(outPath, { flags: 'a' });

  outStream.write(`-- RetroVault 번역 자동화 SQL 파일\n-- 생성일: ${new Date().toISOString()}\n\n`);

  if (targetTable === 'all') {
    for (const [key, config] of Object.entries(TABLE_CONFIG)) {
      await processTable(key, config, outStream, applyToDb);
    }
  } else if (TABLE_CONFIG[targetTable]) {
    await processTable(targetTable, TABLE_CONFIG[targetTable], outStream, applyToDb);
  } else {
    console.error(`❌ 알 수 없는 테이블입니다: ${targetTable}`);
  }

  outStream.end();
  console.log(`\n✨ 모든 작업 완료!`);
  console.log(`📄 생성된 SQL 파일: ${outPath}`);
  
  if (applyToDb) {
    console.log(`🚀 (--apply) SQL 쿼리가 데이터베이스에 직접 반영되었습니다.`);
  } else {
    console.log(`⚠️ 데이터베이스에 바로 적용되지 않았습니다. 적용하려면 --apply 옵션을 추가하세요.`);
  }

  await pool.end();
}

main().catch(console.error);
