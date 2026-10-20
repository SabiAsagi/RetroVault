const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadUpload(session = { user: { id: 'owner' } }) {
  const uploads = [];
  const dependencies = {
    '@vercel/blob': { put: async (pathname, body, options) => {
      uploads.push({ pathname, size: body.byteLength, options });
      return { url: 'https://example.test/image.png' };
    } },
    'next/server': { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    'next-auth': { getServerSession: async () => session },
    '@/lib/auth': { authOptions: {} },
  };
  const filename = path.join(__dirname, '../src/app/api/upload/route.ts');
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = { exports: {}, URL, process: { env: {} }, console, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context, { filename });
  return { post: context.exports.POST, uploads };
}

function request(size, length) {
  const headers = new Map([['content-type', 'image/png']]);
  if (length !== undefined) headers.set('content-length', String(length));
  return {
    url: 'https://example.test/api/upload?filename=image.png', headers,
    arrayBuffer: async () => new ArrayBuffer(size),
  };
}

test('oversize uploads are rejected without trusting content-length', async () => {
  for (const length of [undefined, 1]) {
    const { post, uploads } = loadUpload();
    const result = await post(request(8 * 1024 * 1024 + 1, length));
    assert.equal(result.status, 413);
    assert.equal(uploads.length, 0);
  }
});

test('empty uploads return a client error without writing a blob', async () => {
  const { post, uploads } = loadUpload();
  assert.equal((await post(request(0))).status, 400);
  assert.equal(uploads.length, 0);
});

test('valid uploads preserve the Vercel Blob owner path and API response', async () => {
  const { post, uploads } = loadUpload();
  const result = await post(request(32));
  assert.equal(result.status, 200);
  assert.equal(result.body.url, 'https://example.test/image.png');
  assert.match(uploads[0].pathname, /^uploads\/owner\//);
  assert.equal(uploads[0].options.allowOverwrite, false);
});

test('anonymous uploads cannot write a blob', async () => {
  const { post, uploads } = loadUpload(null);
  assert.equal((await post(request(32))).status, 401);
  assert.equal(uploads.length, 0);
});
