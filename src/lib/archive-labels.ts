export const archiveCountryLabels: Record<string, string> = {
  Japan: '일본', 'United States': '미국', 'South Korea': '한국', 'United Kingdom': '영국',
  France: '프랑스', Canada: '캐나다', Germany: '독일', Sweden: '스웨덴', Poland: '폴란드',
  China: '중국', Australia: '호주', Russia: '러시아', Spain: '스페인', Italy: '이탈리아',
  Netherlands: '네덜란드', Finland: '핀란드', Norway: '노르웨이', Denmark: '덴마크',
  Brazil: '브라질', Taiwan: '대만',
};

export function isKnownManufacturer(value: string | null | undefined): value is string {
  return !!value?.trim() && !/^(unknown|n\/a|null|\d+)$/i.test(value.trim());
}

export function manufacturerLabel(value: string | null | undefined) {
  return isKnownManufacturer(value) ? value : '제조사 정보 확인 중';
}
