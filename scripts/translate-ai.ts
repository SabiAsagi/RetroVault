import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

// Gemini Client Initialization
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const BATCH_SIZE = 10;
const MAX_PROCESS = 1000; // 한 번 실행할 때 최대 몇 개를 처리할지

async function translateCompanies() {
  if (!ai) throw new Error("GEMINI_API_KEY is not set.");

  const untranslated = await prisma.company.findMany({
    where: { 
      flagshipFranchises: null, // 맞춤 항목이 비어있는 회사들만
      status: 'APPROVED'
    },
    take: MAX_PROCESS,
    orderBy: { views: 'desc' }, // 인기 있는 회사부터 먼저 번역
  });

  console.log(`[Company] 번역이 필요한 회사 수: ${untranslated.length} 개`);

  for (let i = 0; i < untranslated.length; i += BATCH_SIZE) {
    const batch = untranslated.slice(i, i + BATCH_SIZE);
    console.log(`[Company] Processing batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);

    const prompt = `
Translate and enrich the following video game companies for a Korean audience.
For each company, provide a good summary (2-3 sentences) in Korean. 
Also deduce the following:
- companyStatus (e.g. 운영 중, 폐업, 인수됨)
- flagshipFranchises (대표작 프랜차이즈, e.g. "슈퍼 마리오, 젤다의 전설")
- keyFigures (주요 인물, e.g. "미야모토 시게루")
- subsidiaries (자회사, e.g. "Retro Studios, Monolith Soft")

Input:
${JSON.stringify(batch.map(c => ({ id: c.id, name: c.name, description: c.description })), null, 2)}
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        companies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              companyStatus: { type: Type.STRING, nullable: true },
              flagshipFranchises: { type: Type.STRING, nullable: true },
              keyFigures: { type: Type.STRING, nullable: true },
              subsidiaries: { type: Type.STRING, nullable: true }
            },
            required: ["id", "description"]
          }
        }
      },
      required: ["companies"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const content = response.text;
      if (!content) continue;

      const result = JSON.parse(content);
      
      for (const item of result.companies) {
        if (!item.id) continue;
        await prisma.company.update({
          where: { id: item.id },
          data: {
            description: item.description || null,
            companyStatus: item.companyStatus || null,
            flagshipFranchises: item.flagshipFranchises || null,
            keyFigures: item.keyFigures || null,
            subsidiaries: item.subsidiaries || null,
          }
        });
        console.log(`✅ Updated Company: ${item.id}`);
      }
      
      // Rate Limit 방지를 위한 대기
      console.log('⏳ Rate limit 방지를 위해 6.5초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 6500));
    } catch (err) {
      console.error(`❌ Error processing batch:`, err);
    }
  }
}

async function translatePlatforms() {
  if (!ai) throw new Error("GEMINI_API_KEY is not set.");

  const untranslated = await prisma.platform.findMany({
    where: { 
      specs: null, // 맞춤 항목이 비어있는 콘솔들만
      status: 'APPROVED'
    },
    take: MAX_PROCESS,
    orderBy: { views: 'desc' }, // 인기 있는 콘솔부터 먼저 번역
  });

  console.log(`[Platform] 번역이 필요한 콘솔 수: ${untranslated.length} 개`);

  for (let i = 0; i < untranslated.length; i += BATCH_SIZE) {
    const batch = untranslated.slice(i, i + BATCH_SIZE);
    console.log(`[Platform] Processing batch ${i / BATCH_SIZE + 1} (${batch.length} items)...`);

    const prompt = `
Translate and enrich the following video game consoles/platforms for a Korean audience.
For each platform, provide a good summary (2-3 sentences) in Korean. 
Also deduce the following:
- specs (간략한 스펙, e.g. "8비트 CPU, 2KB RAM")
- launchPrice (출시 가격, e.g. "14,800엔 / $199")
- mediaFormat (저장 매체, e.g. "롬 카트리지", "CD-ROM")
- generation (콘솔 세대, numeric integer like 3, 4, 5. if unknown use null)

Input:
${JSON.stringify(batch.map(p => ({ id: p.id, name: p.name, description: p.description, manufacturer: p.manufacturer })), null, 2)}
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        platforms: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              specs: { type: Type.STRING, nullable: true },
              launchPrice: { type: Type.STRING, nullable: true },
              mediaFormat: { type: Type.STRING, nullable: true },
              generation: { type: Type.INTEGER, nullable: true }
            },
            required: ["id", "description"]
          }
        }
      },
      required: ["platforms"]
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      });

      const content = response.text;
      if (!content) continue;

      const result = JSON.parse(content);
      
      for (const item of result.platforms) {
        if (!item.id) continue;
        await prisma.platform.update({
          where: { id: item.id },
          data: {
            description: item.description || null,
            specs: item.specs || null,
            launchPrice: item.launchPrice || null,
            mediaFormat: item.mediaFormat || null,
            generation: item.generation || null,
          }
        });
        console.log(`✅ Updated Platform: ${item.id}`);
      }

      // Rate Limit 방지를 위한 대기
      console.log('⏳ Rate limit 방지를 위해 6.5초 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 6500));
    } catch (err) {
      console.error(`❌ Error processing batch:`, err);
    }
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ 오류: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.");
    console.error("루트 디렉토리의 .env 파일에 GEMINI_API_KEY=AIza... 형식으로 키를 입력해주세요.");
    process.exit(1);
  }

  console.log('🚀 Gemini AI 기반 자동 번역 스크립트 시작...');
  
  // 콘솔 번역 (1000개 제한)
  await translatePlatforms();
  
  // 제작사 번역 (1000개 제한)
  await translateCompanies();

  console.log('✅ Gemini AI 기반 번역 작업 완료!');
}

main().catch(console.error);
