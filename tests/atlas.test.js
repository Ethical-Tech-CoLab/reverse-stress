'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { createServer, publicNames } = require('../server');
const root = path.join(__dirname, '..');
const context = { window: {} };
for (const name of ['public-sources.js', 'data.js']) {
  vm.runInNewContext(fs.readFileSync(path.join(root, name), 'utf8'), context);
}
const A = context.window.ATLAS;
const sources = context.window.RESEARCH_SOURCES;
const ids = new Set(A.concepts.map(c => c.id));
const sourceMap = new Map(sources.map(s => [s.id, s]));
const privateNames = /\b(?:Microsoft|MSFT|LMCO|Lockheed(?:\s+Martin)?|Dara(?:\s+Systems)?|Genome)\b/i;
const privatePeople = /Yorke Rhodes|Jeff Chang|Eugene Linkov|Joshua J\. Trump|Emre Kıcıman|John Winn|Suman Nath|Jonathan Mace|Dave Williams/i;

test('twenty-one entries separate research, guidance, and teaching without private document metadata', () => {
  assert.equal(sources.length, 21);
  assert.equal(sources.filter(s => A.sourceMeta[s.id].level === 'primary').length, 16);
  for (const s of sources) {
    assert.ok(s.sections.length > 0, s.id);
    assert.ok(s.sections.some(p => p.text.trim().length > 30), s.id);
    assert.equal(new Set(s.sections.map(p => p.label)).size, s.sections.length, `${s.id} anchor uniqueness`);
    assert.equal(s.filename, undefined, 'original filename must not be public');
    assert.equal(s.sha256, undefined, 'private fingerprints are not teaching content');
    assert.equal(s.duplicates, undefined);
    assert.ok(A.sourceMeta[s.id]?.note, `${s.id} attribution`);
    assert.ok(A.sourceMeta[s.id]?.authors, `${s.id} authors`);
  }
});

test('every editorial reference resolves to a paraphrased reference anchor', () => {
  let count = 0;
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value) && /^S\d{2}$/.test(value[0]) && typeof value[1] === 'string') {
      assert.ok(sourceMap.get(value[0])?.sections.some(s => s.label === value[1]), `${value[0]} ${value[1]}`);
      count++;
      return;
    }
    for (const child of Object.values(value)) walk(child);
  }
  walk(A);
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  for (const [, id, label] of app.matchAll(/\['(S\d{2})','([^']+)'\]/g)) {
    assert.ok(sourceMap.get(id)?.sections.some(s => s.label === label), `${id} ${label}`);
    count++;
  }
  assert.ok(count > 200, `expected substantial source coverage, got ${count}`);
});

test('public resources have readable access routes, evidence limits, and point-of-use references', () => {
  const added=sources.filter(s => Number(s.id.slice(1))>=12);
  assert.equal(added.length, 10);
  for (const s of sources.filter(s => A.sourceMeta[s.id].level === 'primary')) {
    const m=A.sourceMeta[s.id];
    for (const field of ['takeaway','access','evidence','read','note','readUrl']) assert.ok(m[field]?.length > 15, `${s.id}: ${field}`);
    assert.equal(m.verifiedOn, '2026-11-09', s.id);
    for (const link of [m.readUrl,m.doi,m.companionUrl].filter(Boolean)) {
      const url=new URL(link);
      assert.equal(url.protocol, 'https:', link);
      assert.equal(url.username+url.password, '', link);
    }
  }
  for (const s of added) {
    assert.ok(A.concepts.some(c => c.refs.some(ref => ref[0]===s.id)), `${s.id} is not wired into the concepts`);
  }
  assert.equal(A.readingPaths.length, 6);
  assert.ok(A.readingPaths.every(p => p.refs.length>=2));
  assert.equal(A.sourceMeta.S04.readUrl, 'https://arxiv.org/abs/2511.07289v2');
  assert.ok(A.sourceMeta.S05.note.includes('No exact public match'));
  assert.ok(A.sourceMeta.S05.readLabel.includes('Related'));
  assert.ok(A.sourceMeta.S06.date.includes('Jan 2021'));
  assert.ok(A.sourceMeta.S17.authors.includes('Daniel Grigat'));
  assert.ok(A.sourceMeta.S15.evidence.includes('case study'));
  assert.equal(A.sourceMeta.S18.kind, 'Modeling standard');
});

test('the concept atlas is complete and all relationships and study cards resolve', () => {
  assert.equal(A.concepts.length, 35);
  assert.equal(ids.size, A.concepts.length);
  for (const id of ['adaptability', 'agility', 'reliability', 'resilience', 'resistance', 'robustness', 'safety', 'security', 'sustainability']) assert.ok(ids.has(id), `nine-concept framing: ${id}`);
  for (const c of A.concepts) {
    for (const key of ['group', 'title', 'subtitle', 'definition', 'why', 'example', 'caution']) assert.ok(c[key]?.length, `${c.id} ${key}`);
    assert.ok(c.refs.length);
    assert.ok(A.groups.includes(c.group));
    for (const id of c.related) assert.ok(ids.has(id), `${c.id} -> ${id}`);
  }
  for (const f of A.flashcards) assert.ok(ids.has(f.concept));
  assert.equal(A.steps.length, 5);
  assert.equal(A.questions.length, 10);
  assert.ok(A.sourceMeta.S03.note.includes('20%'));
  assert.ok(A.concepts.find(c => c.id === 'threshold').definition.includes('25%'));
  assert.ok(A.concepts.find(c => c.id === 'probabilities').caution.includes('calibrated'));
});

test('all JavaScript parses and all browser assets are local', () => {
  for (const name of ['app.js', 'public-sources.js', 'data.js', 'server.js']) new vm.Script(fs.readFileSync(path.join(root, name), 'utf8'), { filename: name });
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    assert.ok(!asset.startsWith('http'), `remote asset: ${asset}`);
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  }
  assert.ok(html.includes('aria-label="Main navigation"'));
  assert.ok(fs.readFileSync(path.join(root, 'styles.css'), 'utf8').includes('@media print'));
});

test('public assets use teaching aliases, retain scholarly attribution, and isolate legacy notes', () => {
  for (const name of publicNames) {
    const text = fs.readFileSync(path.join(root, name), 'utf8');
    assert.equal(privateNames.test(text), false, `${name}: private organization name`);
    assert.equal(privatePeople.test(text), false, `${name}: scenario personnel`);
    assert.equal(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text), false, `${name}: contact address`);
  }
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const alias of ['High Tech', 'ISV', 'SI']) assert.ok(index.includes(alias));
  assert.ok(A.concepts.find(c => c.id === 'supplier-knowledge-graph').title.includes('Supplier Knowledge Graph'));
  assert.ok(A.sourceMeta.S05.authors.includes('Madison Smith'));
  assert.ok(A.sourceMeta.S06.authors.includes('Igor Linkov'));
  for (const p of A.people) assert.ok(p.note.startsWith('Teaching role:'));
  const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.ok(app.includes("const storageKey = 'resilience-atlas-public-v1'"));
  assert.equal(app.includes("'resilience-atlas-v1'"), false);
  assert.equal(app.includes('originalLink('), false);
});

test('public build contains only the allowlisted assets and is independent of private extraction', () => {
  execFileSync(process.execPath, [path.join(root, 'tools', 'build-public.js')], { cwd: root });
  assert.deepEqual(fs.readdirSync(path.join(root, 'dist')).sort(), [...publicNames].sort());
  for (const name of publicNames) {
    const content = fs.readFileSync(path.join(root, 'dist', name));
    assert.deepEqual(content, fs.readFileSync(path.join(root, name)), name);
    assert.equal(privateNames.test(content.toString()), false, name);
  }
});

test('loopback server serves only public assets and denies all source-document routes', async t => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes('Resilience Atlas'));
  for (const asset of publicNames) {
    const response = await fetch(`${base}/${asset}`, { method: 'HEAD' });
    assert.equal(response.status, 200, asset);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(Number(response.headers.get('content-length')) > 0);
    assert.ok(response.headers.get('content-security-policy').includes("connect-src 'self'"));
  }
  for (const denied of ['/server.js', '/package.json', '/sources.js', '/source-text/sources.json', '/originals/..%5Cserver.js', '/%2e%2e%5Csecret', '/originals/unknown.pdf', '/tools/extract_sources.py']) {
    for (const method of ['GET', 'HEAD']) assert.equal((await fetch(base + denied, { method })).status, 404, `${method} ${denied}`);
  }
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
});
