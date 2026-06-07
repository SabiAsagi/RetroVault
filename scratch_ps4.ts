import * as cheerio from 'cheerio';

async function main() {
  const res = await fetch('https://en.wikipedia.org/wiki/PlayStation_4');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  $('.infobox th').each((i, el) => {
    console.log($(el).text().trim());
  });
}
main();
