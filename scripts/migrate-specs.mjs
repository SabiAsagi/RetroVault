import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  console.log("Starting Platform Specs Migration with Gemini (Rate Limit Safe)...");

  const platforms = await prisma.platform.findMany({
    where: {
      OR: [
        { specs_cpu: null },
        { specs_cpu: '' }
      ],
      NOT: {
        specs: null
      }
    }
  });

  console.log(`Found ${platforms.length} platforms to migrate.`);

  for (const p of platforms) {
    console.log(`Processing ${p.name}...`);
    
    const prompt = `
You are a database migration assistant.
Analyze the following console platform's hardware specs and peripheral input info.
Extract the CPU, GPU, Memory, and Peripherals into structured fields in both English and Korean.
If info is missing, just return null or empty string. Keep it concise (e.g. "Custom AMD RDNA 2").

Platform Name: ${p.name}
Existing Specs: ${p.specs || 'N/A'}
Existing Additional Input (Peripherals): ${p.additionalInput || 'N/A'}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              specs_cpu: { type: Type.STRING },
              specs_gpu: { type: Type.STRING },
              specs_memory: { type: Type.STRING },
              peripherals: { type: Type.STRING },
              specs_cpu_ko: { type: Type.STRING },
              specs_gpu_ko: { type: Type.STRING },
              specs_memory_ko: { type: Type.STRING },
              peripherals_ko: { type: Type.STRING },
            }
          }
        }
      });

      const responseText = response.text;
      const extracted = JSON.parse(responseText);

      await prisma.platform.update({
        where: { id: p.id },
        data: {
          specs_cpu: extracted.specs_cpu || null,
          specs_gpu: extracted.specs_gpu || null,
          specs_memory: extracted.specs_memory || null,
          peripherals: extracted.peripherals || null,
          specs_cpu_ko: extracted.specs_cpu_ko || null,
          specs_gpu_ko: extracted.specs_gpu_ko || null,
          specs_memory_ko: extracted.specs_memory_ko || null,
          peripherals_ko: extracted.peripherals_ko || null,
        }
      });

      console.log(`✅ Updated ${p.name}`);
      
      // Sleep for 4 seconds to stay safely under Gemini 15 RPM free tier limit
      await new Promise(r => setTimeout(r, 4000));
    } catch (err) {
      console.error(`❌ Failed to process ${p.name}:`, err.message);
      // Wait a bit longer if we hit a rate limit
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log("Migration completed!");
  await prisma.$disconnect();
}

main().catch(console.error);
