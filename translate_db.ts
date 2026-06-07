import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const countryMap: Record<string, string> = {
  'European Union': '유럽 연합',
  'Canada': '캐나다',
  'United States of America': '미국',
  'United Kingdom': '영국',
  'Germany': '독일',
  "FrancePeople's Republic of China": '프랑스 / 중국',
  'Singapore': '싱가포르',
  'Netherlands': '네덜란드',
  'Korea': '대한민국',
  'South Korea': '대한민국',
  'France': '프랑스',
  'Italy': '이탈리아',
  'Spain': '스페인',
  'Japan': '일본',
  'Hong Kong': '홍콩',
  "People's Republic of China": '중국',
  'New Zealand': '뉴질랜드',
  'Australia': '호주',
  'British Hong Kong': '영국령 홍콩',
  'United Arab Emirates': '아랍에미리트',
  'Denmark': '덴마크',
  'United States of AmericaUnited Kingdom': '미국 / 영국',
  'Taiwan': '대만',
  'Brazil': '브라질',
  'Soviet Union': '소련',
  'Russia': '러시아',
  'Turkey': '튀르키예',
  'Mexico': '멕시코',
  "PolandPolish People's Republic": '폴란드',
  'Poland': '폴란드',
  'Slovenia': '슬로베니아',
  'United KingdomNew Zealand': '영국 / 뉴질랜드',
  'German Democratic Republic': '동독',
  'Belgium': '벨기에',
  'Hungary': '헝가리',
  'JapanItaly': '일본 / 이탈리아',
  'DenmarkGermany': '덴마크 / 독일',
  'Ukraine': '우크라이나',
  'Argentina': '아르헨티나',
  'Sweden': '스웨덴',
  'South Africa': '남아프리카 공화국',
  'Bulgaria': '불가리아',
  'West Germany': '서독',
  'Finland': '핀란드',
  'Czech Republic': '체코',
  'Austria': '오스트리아'
};

const inputMap: Record<string, string> = {
  'light gunpaddle': '라이트 건, 패들',
  'light gun': '라이트 건',
  'paddle': '패들',
  'light gunsim racing wheel': '라이트 건, 레이싱 휠',
  'joystick': '조이스틱',
  'sim racing wheel': '레이싱 휠',
  'control knoblight gun': '컨트롤 노브, 라이트 건',
  'light guncontrol knob': '라이트 건, 컨트롤 노브',
  'light gunjoystick': '라이트 건, 조이스틱'
};

function translateDescription(desc: string) {
  if (!desc) return desc;
  let translated = desc;
  translated = translated.replace(/Pong (console|home console|system|video game|machine|unit)/gi, '퐁 콘솔');
  translated = translated.replace(/Home Pong console/gi, '가정용 퐁 콘솔');
  translated = translated.replace(/PC-50x (series|Pong console|Family)/gi, 'PC-50x 제품군');
  translated = translated.replace(/clone of/gi, '복제 기기:');
  translated = translated.replace(/pre-installed games/gi, '게임 내장');
  translated = translated.replace(/black and white/gi, '흑백');
  translated = translated.replace(/Black case/gi, '검은색 케이스');
  translated = translated.replace(/video output/gi, '비디오 출력');
  translated = translated.replace(/color/gi, '컬러');
  return translated;
}

async function run() {
  const platforms = await prisma.platform.findMany({
    where: { generation: 1 }
  });

  let updateCount = 0;
  for (const p of platforms) {
    let newCountry = p.country;
    if (p.country && countryMap[p.country]) {
      newCountry = countryMap[p.country];
    }

    let newInput = p.additionalInput;
    if (p.additionalInput && inputMap[p.additionalInput]) {
      newInput = inputMap[p.additionalInput];
    } else if (p.additionalInput) {
      newInput = p.additionalInput.replace(/light gun/gi, '라이트 건').replace(/paddle/gi, '패들').replace(/joystick/gi, '조이스틱');
    }

    let newDesc = p.description;
    if (p.description) {
      newDesc = translateDescription(p.description);
    }

    if (newCountry !== p.country || newInput !== p.additionalInput || newDesc !== p.description) {
      await prisma.platform.update({
        where: { id: p.id },
        data: {
          country: newCountry,
          additionalInput: newInput,
          description: newDesc
        }
      });
      updateCount++;
    }
  }

  console.log(`Updated ${updateCount} platforms with Korean translations.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
