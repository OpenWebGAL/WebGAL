#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VALID_SCREENS = new Set([
  'title',
  'textbox',
  'choose',
  'save',
  'load',
  'options',
  'flowchart',
  'menuPanel',
  'backlog',
  'extra',
  'bottomControlPanel',
  'globalDialog',
]);

function parseArgs(argv) {
  let targetDir = 'my-webgal-screen';
  let screen = 'title';
  let variantId = '';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--screen' && argv[i + 1]) {
      screen = argv[++i];
    } else if (arg === '--variant' && argv[i + 1]) {
      variantId = argv[++i];
    } else if (!arg.startsWith('-')) {
      targetDir = arg;
    }
  }

  return {
    targetDir,
    screen,
    variantId: variantId || `custom-${screen.toLowerCase()}`,
  };
}

function copyTemplateDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTemplateDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  const { targetDir, screen, variantId } = parseArgs(process.argv.slice(2));
  if (!VALID_SCREENS.has(screen)) {
    console.error(`Invalid --screen "${screen}". Expected one of: ${Array.from(VALID_SCREENS).join(', ')}`);
    process.exit(1);
  }

  const destRoot = path.resolve(process.cwd(), targetDir);
  if (fs.existsSync(destRoot) && fs.readdirSync(destRoot).length > 0) {
    console.error(`Target directory "${destRoot}" already exists and is not empty.`);
    process.exit(1);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const templateRoot = path.resolve(__dirname, '../template');
  copyTemplateDir(templateRoot, destRoot);

  const pkgPath = path.join(destRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.name = path.basename(destRoot);
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

  const manifestPath = path.join(destRoot, 'webgal-screen.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.screen = screen;
  manifest.variantId = variantId;
  manifest.name = `Custom ${screen}`;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Created WebGAL UI screen project at ${destRoot}`);
  console.log(`Target screen: ${screen} (variantId: ${variantId})`);
  console.log('\nNext steps:');
  console.log(`  cd ${targetDir}`);
  console.log('  npm install');
  console.log('  npm run typecheck');
  console.log('  npm run export');
}

main();
