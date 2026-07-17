import pg from 'pg';

const { Client } = pg;

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error('PostgreSQL connection environment variable is missing.');
}

const client = new Client({ connectionString });

const archiveTables = [
  'CollectionGroupItem',
  'Screenshot',
  'Review',
  'TimelineEvent',
  'CollectionItem',
  'Game',
  'Platform',
  'Company',
];

async function main() {
  await client.connect();

  for (const table of archiveTables) {
    await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    console.log(`Dropped stale archive table when present: ${table}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
