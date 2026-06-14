import https from 'https';

const logos = [
  'https://upload.wikimedia.org/wikipedia/commons/4/4e/Playstation_logo_colour.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b3/PlayStation_2_logo.png', // wait, let's test svg: 'https://upload.wikimedia.org/wikipedia/commons/7/76/PlayStation_2_logo.svg'
  'https://upload.wikimedia.org/wikipedia/commons/0/05/PlayStation_3_logo_%282009%29.svg',
  'https://upload.wikimedia.org/wikipedia/commons/8/87/PlayStation_4_logo_and_wordmark.svg',
  'https://upload.wikimedia.org/wikipedia/commons/3/36/PlayStation_5_logo_and_wordmark.svg',
  'https://upload.wikimedia.org/wikipedia/commons/e/e4/PSP_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/6/6d/PlayStation_Vita_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/04/Nintendo_64_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/2c/SNES_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b2/NES_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fc/Nintendo_GameCube_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b1/Wii_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b6/Wii_U_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/8/88/Nintendo_Switch_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f3/Nintendo_Game_Boy_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/c/c5/Game_Boy_Color_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/8/87/Game_Boy_Advance_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/af/Nintendo_DS_Logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/19/Nintendo_3DS_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/8/8c/XBOX_logo_2001.svg',
  'https://upload.wikimedia.org/wikipedia/commons/0/00/Xbox_360_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_One_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/1/13/Xbox_logo_2019.svg',
  'https://upload.wikimedia.org/wikipedia/commons/4/42/Sega_Mega_Drive_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/e/ec/Sega_Saturn_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dreamcast_logo.svg'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', () => resolve({ url, status: 'ERROR' })).end();
  });
}

async function main() {
  for (const url of logos) {
    const result = await checkUrl(url);
    if (result.status !== 200) {
      console.log(`FAIL: ${result.status} - ${url}`);
    } else {
      console.log(`OK: ${url}`);
    }
  }
}
main();
