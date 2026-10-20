const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relativePath) {
  const calls = { users: [], profiles: [], items: [], groups: [] };
  const prisma = {
    user: {
      findMany: async query => { calls.users.push(query); return []; },
      findUnique: async query => { calls.profiles.push(query); return { id: 'owner' }; },
      findFirst: async query => { calls.profiles.push(query); return { id: 'owner' }; },
    },
    collectionItem: { findMany: async query => { calls.items.push(query); return []; } },
    collectionGroup: { findMany: async query => { calls.groups.push(query); return []; } },
  };
  const dependencies = {
    '@/lib/prisma': { prisma },
    'next-auth': { getServerSession: async () => null },
    '@/lib/auth': { authOptions: {} },
    '@/components/Community': { default: () => null },
    react: { Suspense: 'suspense' },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }) },
  };
  const filename = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = { exports: {}, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context, { filename });
  return { actions: context.exports, calls };
}

test('public community queries exclude private items and select safe user fields', async () => {
  const { actions, calls } = load('src/app/community/page.tsx');
  await actions.default();
  const userQuery = calls.users[0];
  assert.equal(userQuery.select.id, true);
  assert.equal(userQuery.select.email, undefined);
  assert.equal(userQuery.select.password, undefined);
  assert.equal(userQuery.select.collections.where.visibility, 'public');
  const groupQuery = calls.groups[0];
  assert.equal(groupQuery.include.items.where.item.visibility, 'public');
  assert.equal(groupQuery.include._count.select.items.where.item.visibility, 'public');
  assert.equal(groupQuery.include.user.select.password, undefined);
  assert.equal(groupQuery.include.user.select.email, undefined);
});

test('public profile lookups hide friends-only and private items as well as group membership', async () => {
  for (const method of ['getUserProfile', 'getUserProfileByNickname']) {
    const { actions, calls } = load('src/app/actions/profile.ts');
    await actions[method]('owner');
    assert.equal(calls.items[0].where.visibility, 'public');
    assert.equal(calls.groups[0].include.items.where.item.visibility, 'public');
    assert.equal(calls.profiles[0].select.email, undefined);
  }
});
