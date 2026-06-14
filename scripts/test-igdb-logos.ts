import { fetchIgdb } from '../src/lib/igdb';

async function main() {
  const data = await fetchIgdb('platforms', 'fields name, platform_logo.url, versions.name, versions.platform_logo.url; where name = "Nintendo 64" | name = "Game Boy" | name = "PlayStation 3" | name = "Game Boy Advance" | name = "Nintendo Switch";');
  console.log(JSON.stringify(data, null, 2));
}
main();
