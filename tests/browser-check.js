'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const { createServer } = require('../server');
const privateNames = /\b(?:Microsoft|MSFT|LMCO|Lockheed(?:\s+Martin)?|Dara(?:\s+Systems)?|Genome)\b/i;

async function main() {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const screenshots = process.env.ATLAS_SCREENSHOTS || path.join(os.tmpdir(), 'resilience-atlas-checks');
  fs.mkdirSync(screenshots, { recursive: true });
  let browser;
  const errors = [];
  const requests = [];
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: true });
    await context.addInitScript(() => {
      localStorage.setItem('resilience-atlas-v1', JSON.stringify({
        pins: ['reverse'],
        checked: ['outcome'],
        notes: 'LEGACY PRIVATE NOTE MUST NOT MIGRATE'
      }));
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('request', request => requests.push(request.url()));
    async function route(name) {
      await page.goto(`${base}/#${name}`);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('#main h1').count(), 1, name);
      assert.equal(privateNames.test(await page.locator('body').innerText()), false, `${name} leaks a private organization`);
    }
    async function noOverflow(label) {
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${label} overflows horizontally`);
    }
    await route('overview');
    assert.equal(await page.locator('.idea-card').count(), 3);
    await noOverflow('desktop overview');
    await page.screenshot({ path: path.join(screenshots, 'atlas-desktop.png') });
    console.log('PASS: desktop overview and local assets');

    await page.keyboard.press('/');
    assert.equal(await page.locator('#global-search').evaluate(el => el === document.activeElement), true);
    await page.locator('#global-search').fill('multivariate');
    await page.locator('#search-results .search-result[data-source]').first().waitFor();
    await page.locator('#search-results .search-result[data-source]').first().click();
    assert.equal(await page.locator('#detail-dialog').evaluate(el => el.open), true);
    assert.ok((await page.locator('.source-section.is-target pre').innerText()).toLowerCase().includes('multivariate'));
    await page.locator('#close-dialog').click();
    await page.locator('#global-search').fill('no-such-concept-928374');
    await page.locator('.search-empty').waitFor();
    assert.ok(await page.locator('.search-empty').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#search-results').isVisible(), false);
    console.log('PASS: public-summary search, reference anchors, empty state, keyboard shortcut');

    await route('concepts');
    assert.equal(await page.locator('.concept-card').count(), 35);
    await page.locator('[data-map-node="resilience"]').press('Enter');
    assert.equal(await page.locator('#map-detail h3').innerText(), 'Resilience');
    await page.locator('[data-group="Performance"]').click();
    assert.equal(await page.locator('.concept-card').count(), 8);
    await page.locator('.concept-card [data-concept="robustness"]').first().click();
    await page.locator('.concept-detail [data-pin="robustness"]').click();
    assert.equal(await page.locator('.concept-detail [data-pin]').getAttribute('aria-pressed'), 'true');
    await page.locator('.concept-detail [data-source="S06"]').first().click();
    assert.ok((await page.locator('#dialog-title').innerText()).startsWith('S06'));
    await page.locator('#source-jump').selectOption('p. 8');
    assert.equal(await page.locator('.source-section.is-target').getAttribute('data-source-section'), 'p. 8');
    await page.locator('#close-dialog').click();
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#breadcrumb').innerText(), 'CONCEPT ATLAS');
    assert.equal(await page.locator('#main').evaluate(el => el === document.activeElement), true);
    console.log('PASS: 35 concepts, performance filter, keyboard map, pins, source jump, skip link');

    await route('lab');
    const allocations = await page.locator('.supplier-value strong').allTextContents();
    assert.deepEqual(allocations, ['2.20 kt', '10.00 kt', '7.80 kt']);
    for (const [loss, rho] of [[5, 0], [30, 0.95], [25, 0.5]]) {
      await page.locator('#loss-slider').evaluate((el, value) => { el.value = String(value); el.dispatchEvent(new Event('input', { bubbles: true })); }, loss);
      await page.locator('#rho-slider').evaluate((el, value) => { el.value = String(value); el.dispatchEvent(new Event('input', { bubbles: true })); }, rho);
      const actual = (await page.locator('.supplier-value strong').allTextContents()).map(parseFloat);
      const rows = [9, 25 + 20 * rho, 16 + 20 * rho];
      const denominator = rows.reduce((a, b) => a + b, 0);
      actual.forEach((value, i) => assert.ok(Math.abs(value - loss * rows[i] / denominator) <= 0.0051));
      assert.ok(Math.abs(actual.reduce((a, b) => a + b, 0) - loss) <= 0.011);
      assert.ok(actual.every((value, i) => value <= [60, 25, 15][i]));
    }
    for (let i = 0; i < 5; i++) {
      await page.locator(`[data-step="${i}"]`).click();
      assert.equal(await page.locator(`#step-detail .step-number`).innerText(), `0${i + 1}`);
    }
    await page.screenshot({ path: path.join(screenshots, 'atlas-lab.png') });
    console.log('PASS: exact synthetic allocation at all slider extremes, conserved total loss, five method steps');

    await route('evidence');
    assert.equal(await page.locator('.version-table tbody tr').count(), 3);
    await page.locator('[data-case="review"]').click();
    assert.ok((await page.locator('.review-chart').innerText()).includes('22%'));
    await page.locator('[data-case="vaccines"]').click();
    assert.ok((await page.locator('#case-content').innerText()).includes('Resilience-by-intervention'));
    await route('engineering');
    assert.equal(await page.locator('.person-card').count(), 4);
    await page.locator('.advisors summary').click();
    assert.ok(await page.locator('.advisors p').isVisible());
    await route('sources');
    assert.equal(await page.locator('.source-card').count(), 21);
    assert.equal(await page.locator('.research-guide .content-card').count(), 6);
    await page.locator('[data-source-filter="primary"]').click();
    assert.equal(await page.locator('.source-card').count(), 16);
    await page.locator('[data-source-filter="added"]').click();
    assert.equal(await page.locator('.source-card').count(), 10);
    assert.equal(await page.locator('.source-grid .source-takeaway').count(), 10);
    assert.ok((await page.locator('.source-grid').innerText()).includes('checked 2026-11-09'));
    await page.locator('[data-source-filter="starting"]').click();
    assert.equal(await page.locator('.source-card').count(), 11);
    await page.locator('[data-source-filter="teaching"]').click();
    assert.equal(await page.locator('.source-card').count(), 5);
    await page.locator('#global-search').fill('interbank');
    await page.locator('#search-results .search-result[data-source="S17"]').first().waitFor();
    await page.locator('#search-results .search-result[data-source="S17"]').first().click();
    assert.ok((await page.locator('.source-reader .source-evidence').innerText()).toLowerCase().includes('financial'));
    assert.equal(await page.locator('.reader-actions a').first().getAttribute('href'), 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5688116/');
    await page.locator('#close-dialog').click();
    console.log('PASS: cases, evidence types, six reading paths, new public-source search, all source filters');

    await route('brief');
    assert.equal(await page.locator('#call-notes').inputValue(), '', 'legacy private notes must not migrate');
    assert.ok((await page.locator('#pinned-concepts').innerText()).includes('Robustness'));
    await page.locator('[data-question="outcome"]').check();
    const note = 'TEST ONLY: owner confirmed.\nNext session to be scheduled.\n<example> & evidence';
    await page.locator('#call-notes').fill(note);
    await page.reload();
    assert.equal(await page.locator('#call-notes').inputValue(), note);
    assert.equal(await page.locator('[data-question="outcome"]').isChecked(), true);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-export]').first().click();
    const download = await downloadPromise;
    const file = await download.path();
    const exported = fs.readFileSync(file, 'utf8');
    assert.ok(exported.includes(note));
    assert.ok(exported.includes('[x] What exactly must not fail?'));
    assert.ok(exported.includes('Robustness'));
    assert.ok(exported.includes('S05'));
    assert.ok(exported.includes('PUBLIC TEACHING BRIEF'));
    assert.ok(exported.includes('https://www.nationalacademies.org/read/13457/chapter/2'));
    assert.ok(exported.includes('https://doi.org/10.1287/inte.2015.0804'));
    assert.ok(exported.includes('https://standards.nasa.gov/standard/nasa/nasa-std-7009'));
    assert.ok(exported.includes('No exact public match'));
    assert.equal(privateNames.test(exported), false, 'export leaks a private organization');
    assert.equal(exported.includes('LEGACY PRIVATE NOTE'), false);
    assert.equal(exported.includes('undefined'), false);
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('#call-notes').isVisible(), false);
    assert.equal(await page.locator('#print-notes').innerText(), note);
    await page.emulateMedia({ media: 'screen' });
    console.log('PASS: private-note isolation; public notes/checks/pins survive reload; sanitized export and full-note printing');

    const sourceIds=await page.evaluate(() => window.RESEARCH_SOURCES.map(s => s.id));
    for (const id of sourceIds) {
      await page.goto(`${base}/#source/${id}`);
      await page.locator('.source-reader').waitFor();
      assert.equal(await page.locator('#dialog-title').evaluate(el => {
        const title=el.getBoundingClientRect();
        const dialog=document.querySelector('#detail-dialog').getBoundingClientRect();
        return title.top>=dialog.top && title.bottom<=dialog.bottom;
      }), true, `${id} should open at its attribution and reading guidance`);
      assert.equal(privateNames.test(await page.locator('.source-reader').innerText()), false, `${id} leaks an organization name`);
      const links = await page.locator('.source-reader a').evaluateAll(elements => elements.map(el => el.getAttribute('href')));
      const allowed=await page.evaluate(id => {
        const m=window.ATLAS.sourceMeta[id];
        return [m.readUrl,m.doi,m.companionUrl].filter(Boolean);
      }, id);
      assert.ok(links.every(link => link.startsWith('#') || allowed.includes(link)), `${id} unexpected source link`);
      assert.ok((await page.locator('.reader-note').innerText()).includes('Editorial paraphrase'));
      await page.locator('#close-dialog').click();
    }
    console.log('PASS: all 21 source readers retain attribution, labeled paraphrases, and only declared public links');

    await page.goto(`${base}/#concept/reverse`);
    await page.locator('.concept-detail').waitFor();
    assert.equal(new URL(page.url()).hash, '#concept/reverse');
    await page.locator('.concept-detail [data-source="S05"][data-label="p. 13"]').click();
    await page.locator('.dialog-meta a').click();
    await page.locator('.source-reader').waitFor();
    assert.equal(new URL(page.url()).hash, '#source/S05/p.%2013');
    await page.reload();
    assert.equal(await page.locator('.source-section.is-target').getAttribute('data-source-section'), 'p. 13');
    await page.locator('#close-dialog').click();
    assert.equal(new URL(page.url()).hash, '#sources');
    console.log('PASS: reloadable concept/source permalinks and close behavior');

    await page.setViewportSize({ width: 390, height: 844 });
    for (const name of ['overview', 'concepts', 'lab', 'evidence', 'engineering', 'sources', 'brief']) {
      await route(name);
      await noOverflow(`mobile ${name}`);
    }
    await page.locator('#menu-button').click();
    assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'true');
    await page.locator('nav [data-nav="concepts"]').click();
    assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'false');
    await page.locator('.sidebar').evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    assert.ok(await page.locator('.sidebar').evaluate(el => el.getBoundingClientRect().right <= 1));
    await page.screenshot({ path: path.join(screenshots, 'atlas-mobile.png') });
    await page.locator('#global-search').fill('covariance');
    await page.locator('#search-results .search-result').first().waitFor();
    await noOverflow('mobile search');
    console.log('PASS: seven mobile routes, mobile navigation, search, no horizontal overflow');
    for (const width of [320, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      for (const name of ['overview', 'concepts', 'lab', 'evidence', 'engineering', 'sources', 'brief']) {
        await route(name);
        await noOverflow(`${width}px ${name}`);
      }
    }
    console.log('PASS: all seven routes at 320px, 768px, and 1024px');

    const offline = await context.newPage();
    offline.on('pageerror', error => errors.push(error.message));
    await offline.goto(pathToFileURL(path.join(__dirname, '..', 'index.html')).href);
    assert.equal(await offline.locator('.idea-card').count(), 3);
    await offline.locator('[data-source="S05"]').first().click();
    assert.ok(await offline.locator('.source-reader').isVisible());
    assert.equal(await offline.locator('a[href^="../"], a[href^="/originals/"]').count(), 0);
    const built = await context.newPage();
    await built.goto(pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href);
    assert.equal(await built.locator('.idea-card').count(), 3);
    assert.equal(privateNames.test(await built.locator('body').innerText()), false);
    console.log('PASS: direct-file offline launch and source reader');
    assert.equal(requests.filter(url => !url.startsWith(base) && !url.startsWith('blob:')).length, 0, 'unexpected external requests');
    assert.deepEqual(errors, [], 'browser errors');
    console.log(`PASS: zero browser errors and zero external requests. Screenshots: ${screenshots}`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
