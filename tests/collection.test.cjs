const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadActions(session = { user: { id: 'owner' } }) {
  const calls = { writes: [], deleted: [], reordered: [], paths: [] };
  const prisma = {
    collectionItem: {
      upsert: async args => { calls.writes.push(args); return { id: 'item' }; },
      update: args => { calls.reordered.push(args); return Promise.resolve({}); },
    },
    collectionGroup: { findFirst: async () => ({ id: 'group' }) },
    collectionGroupItem: {
      deleteMany: async args => { calls.deleted.push(args); },
      upsert: async () => ({}), create: async () => ({}),
    },
    $transaction: async operations => Promise.all(operations),
  };
  const dependencies = {
    zod: require('zod'),
    '@/lib/prisma': { prisma },
    'next-auth': { getServerSession: async () => session },
    '@/lib/auth': { authOptions: {} },
    'next/cache': { revalidatePath: value => calls.paths.push(value) },
    '@/constants/collection': { DEFAULT_OWNERSHIP_STATUS: '위시리스트', DEFAULT_PLAY_STATUS: '미플레이' },
  };
  const filename = path.join(__dirname, '../src/app/actions/collection.ts');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context, { filename });
  return { actions: context.exports, calls };
}

test('editing a memo preserves existing group membership', async () => {
  const { actions, calls } = loadActions();
  await actions.updateCollectionItem('game', { memo: '추억' });
  assert.equal(calls.deleted.length, 0);
  assert.equal(calls.writes[0].update.memo, '추억');
  assert.ok(calls.paths.includes('/collection'));
});

test('explicitly clearing the group removes membership', async () => {
  const { actions, calls } = loadActions();
  await actions.updateCollectionItem('game', { groupId: '' });
  assert.equal(calls.deleted.length, 1);
});

test('legacy status is translated to the database ownership field', async () => {
  const { actions, calls } = loadActions();
  await actions.updateCollectionItem('game', { status: '미개봉' });
  assert.equal(calls.writes[0].update.ownershipStatus, '미개봉');
  assert.equal('status' in calls.writes[0].update, false);
});

test('batch edits preserve groups unless requested', async () => {
  const { actions, calls } = loadActions();
  await actions.batchUpdateCollectionItems(['one', 'two'], { visibility: 'private' });
  assert.equal(calls.writes.length, 2);
  assert.equal(calls.deleted.length, 0);
});

test('order persists with every update scoped to the signed-in owner', async () => {
  const { actions, calls } = loadActions();
  await actions.reorderCollectionItems(['two', 'one']);
  assert.equal(calls.reordered.length, 2);
  assert.equal(calls.reordered[0].where.userId_gameId.userId, 'owner');
  assert.equal(calls.reordered[0].where.userId_gameId.gameId, 'two');
  assert.equal(calls.reordered[1].data.sortOrder, 1);
});

test('duplicate or malformed ordering is rejected before database writes', async () => {
  for (const ids of [['one', 'one'], [''], [42], null]) {
    const { actions, calls } = loadActions();
    await assert.rejects(actions.reorderCollectionItems(ids), /Invalid collection order/);
    assert.equal(calls.reordered.length, 0);
  }
});

test('anonymous users cannot write collections or order', async () => {
  const { actions, calls } = loadActions(null);
  await assert.rejects(actions.updateCollectionItem('game', {}), /Not logged in/);
  await assert.rejects(actions.batchUpdateCollectionItems(['game'], {}), /Not logged in/);
  await assert.rejects(actions.reorderCollectionItems(['game']), /Not logged in/);
  assert.equal(calls.writes.length + calls.reordered.length, 0);
});

test('ownership fields and invalid rating values cannot be injected', async () => {
  for (const data of [{ userId: 'other-user' }, { gameId: 'other-game' }, { rating: 0.5 }, { rating: 6 }, { visibility: 'unknown' }]) {
    const { actions, calls } = loadActions();
    await assert.rejects(actions.updateCollectionItem('game', data));
    await assert.rejects(actions.batchUpdateCollectionItems(['game'], data));
    assert.equal(calls.writes.length, 0);
  }
});
