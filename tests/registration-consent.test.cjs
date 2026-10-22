const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');

function moduleFromFile(relativePath, dependencies) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, Buffer, Date, process: { env: { NEXTAUTH_SECRET: 'test-only-secret' } }, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context, { filename });
  return context.exports;
}

const legal = moduleFromFile('src/lib/legal.ts', {});
const consent = moduleFromFile('src/lib/registration-consent.ts', {
  'node:crypto': crypto, zod: require('zod'), './legal': legal,
});
const valid = { ageConfirmed: true, termsAccepted: true, privacyAccepted: true, policyVersion: legal.POLICY_VERSION };

test('registration requires each confirmation and the current policy version', () => {
  assert.equal(consent.registrationConsentSchema.safeParse(valid).success, true);
  for (const key of ['ageConfirmed', 'termsAccepted', 'privacyAccepted']) {
    assert.equal(consent.registrationConsentSchema.safeParse({ ...valid, [key]: false }).success, false);
    const missing = { ...valid }; delete missing[key];
    assert.equal(consent.registrationConsentSchema.safeParse(missing).success, false);
  }
  assert.equal(consent.registrationConsentSchema.safeParse({ ...valid, policyVersion: 'old' }).success, false);
});

test('consent token checks signature, secret, expiry and future dates', () => {
  const now = 1000000;
  const token = consent.createConsentToken('test-only-secret', now);
  assert.equal(consent.verifyConsentToken(token, 'test-only-secret', now), true);
  assert.equal(consent.verifyConsentToken(token + 'x', 'test-only-secret', now), false);
  assert.equal(consent.verifyConsentToken(token, 'wrong-secret', now), false);
  assert.equal(consent.verifyConsentToken(token, 'test-only-secret', now + 600000), false);
  assert.equal(consent.verifyConsentToken(token, 'test-only-secret', now - 1), false);
  assert.equal(consent.verifyConsentToken(undefined, 'test-only-secret', now), false);
  assert.equal(consent.verifyConsentToken(token, undefined, now), false);
});

function authWith({ existing = false, token } = {}) {
  const provider = () => ({});
  return moduleFromFile('src/lib/auth.ts', {
    'next-auth/providers/credentials': { default: provider },
    'next-auth/providers/github': { default: provider },
    'next-auth/providers/google': { default: provider },
    'next-auth/providers/kakao': { default: provider },
    'next-auth/providers/naver': { default: provider },
    '@next-auth/prisma-adapter': { PrismaAdapter: () => ({}) },
    './prisma': { prisma: { account: { findUnique: async () => existing ? { id: 'linked-account' } : null } } },
    bcryptjs: { default: {} },
    'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
    './registration-consent': consent,
  }).authOptions;
}

test('new OAuth accounts are blocked until consent while existing users can sign in', async () => {
  const account = { type: 'oauth', provider: 'google', providerAccountId: 'test-account' };
  assert.equal(await authWith().callbacks.signIn({ account }), '/register?notice=consent-required');
  assert.equal(await authWith({ existing: true }).callbacks.signIn({ account }), true);
  const token = consent.createConsentToken('test-only-secret');
  assert.equal(await authWith({ token }).callbacks.signIn({ account }), true);
  assert.equal(await authWith().callbacks.signIn({ account: { type: 'credentials' } }), true);
});

test('email registration rejects missing confirmations before querying or creating users', async () => {
  let databaseCalls = 0;
  const route = moduleFromFile('src/app/api/auth/register/route.ts', {
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    '@/lib/prisma': { prisma: { user: { findUnique: async () => { databaseCalls++; }, create: async () => { databaseCalls++; } } } },
    bcryptjs: { default: {} }, zod: require('zod'), '@/lib/registration-consent': consent,
  });
  const result = await route.POST({ json: async () => ({ email: 'qa@example.test', nickname: 'QA', password: 'test-password' }) });
  assert.equal(result.status, 400);
  assert.equal(databaseCalls, 0);
});
