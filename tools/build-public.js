'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { publicNames } = require('../server');

const root = path.join(__dirname, '..');
const output = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });

for (const name of fs.readdirSync(output)) {
  if (!publicNames.has(name)) {
    throw new Error(`Unexpected file in public output: ${name}. Review it before publishing; the build will not delete or publish it.`);
  }
}
for (const name of publicNames) {
  fs.copyFileSync(path.join(root, name), path.join(output, name));
}
console.log(`Built ${publicNames.size} public assets in dist. Publish only this folder, never the repository root.`);
