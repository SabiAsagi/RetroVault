import { fetchIgdb } from '../src/lib/igdb';

async function test() {
  const query = `
    fields name, platforms.name, involved_companies.company.name;
    where name = "Suna no Embrace: Eden no Sato no Never" | name = "Chomp Chomp";
  `;
  const res = await fetchIgdb('games', query);
  console.log(JSON.stringify(res, null, 2));
}
test();
