const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const catalog = require('../src/data/hardware-catalog.json');

function load(session = { user: { id: 'owner' } }) {
  const calls = { reads: [], writes: [], deletes: [] };
  const dependencies = {
    '@/lib/prisma': { prisma: { hardwareCollectionItem: {
      findMany: async q => { calls.reads.push(q); return [{ catalogId: 'ds-lite', status: 'OWNED', quantity: 1, memo: '추억' }]; },
      upsert: async q => { calls.writes.push(q); },
      deleteMany: async q => { calls.deletes.push(q); },
    } } },
    'next-auth': { getServerSession: async () => session },
    '@/lib/auth': { authOptions: {} },
    'next/cache': { revalidatePath: () => {} },
    '@/lib/hardware': { getHardware: id => catalog.find(e => e.id === id) },
    zod: require('zod'),
  };
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/actions/hardware.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require: name => { assert.ok(name in dependencies, name); return dependencies[name]; } };
  vm.runInNewContext(source, context);
  return { actions: context.exports, calls };
}
const valid = { catalogId: 'ds-lite', status: 'OWNED', quantity: 2, memo: '추억' };

test('hardware reads, writes, and removal always use the signed-in owner', async () => {
  const { actions, calls } = load();
  await actions.getHardwareCollection();
  assert.equal(calls.reads[0].where.userId, 'owner');
  assert.equal(calls.reads[0].select.userId, undefined);
  assert.equal((await actions.saveHardwareCollection(valid)).ok, true);
  assert.equal(calls.writes[0].where.userId_catalogId.userId, 'owner');
  assert.equal(calls.writes[0].create.userId, 'owner');
  assert.equal(calls.writes[0].update.userId, undefined);
  assert.equal((await actions.removeHardwareCollection('ds-lite')).ok, true);
  assert.equal(calls.deletes[0].where.userId, 'owner');
  assert.equal(calls.deletes[0].where.catalogId, 'ds-lite');
});

test('signed-out visitors cannot read, save, or remove hardware records', async () => {
  const { actions, calls } = load(null);
  assert.equal((await actions.getHardwareCollection()).length, 0);
  assert.equal((await actions.saveHardwareCollection(valid)).ok, false);
  assert.equal((await actions.removeHardwareCollection('ds-lite')).ok, false);
  assert.equal(calls.reads.length + calls.writes.length + calls.deletes.length, 0);
});

test('catalog ids, quantity limits, status, and private input are validated before writes', async () => {
  const { actions, calls } = load();
  for (const change of [{ userId: 'victim' }, { visibility: 'public' }, { catalogId: 'invented' }, { quantity: 0 }, { quantity: 100 }, { quantity: 1.5 }, { memo: 'x'.repeat(2001) }, { status: 'PUBLIC' }]) {
    assert.equal((await actions.saveHardwareCollection({ ...valid, ...change })).ok, false);
  }
  assert.equal(calls.writes.length, 0);
  assert.equal((await actions.saveHardwareCollection({ ...valid, status: 'WISHLIST', quantity: 99 })).ok, true);
});

test('catalog entries have stable unique ids, official sources, and available local photos', () => {
  assert.equal(new Set(catalog.map(e => e.id)).size, catalog.length);
  for (const e of catalog) {
    assert.ok(['blog.playstation.com', 'sonyinteractive.com', 'www.nintendo.co.jp'].includes(new URL(e.sourceUrl).hostname));
    if (e.parentId) assert.ok(catalog.some(p => p.id === e.parentId));
    if (e.image) assert.ok(fs.existsSync(path.join(__dirname, '../public', e.image)), e.image);
  }
});
