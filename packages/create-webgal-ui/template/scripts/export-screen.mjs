import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const EXPECTED_REACT_MAJOR = '18';
const PROJECT_ROOT = process.cwd();

function parseMajor(spec) {
  if (typeof spec !== 'string') return null;
  const match = spec.trim().match(/^[~^=v]*(\d+)(?:\.\d+)?/);
  return match ? match[1] : null;
}

function verifyReactVersion() {
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  for (const field of ['peerDependencies', 'devDependencies']) {
    const deps = pkg[field] ?? {};
    for (const dep of ['react', 'react-dom']) {
      if (!(dep in deps)) {
        console.error(
          `[export-screen] ERROR: ${field}.${dep} is required and must target React ${EXPECTED_REACT_MAJOR}.x.`,
        );
        process.exit(1);
      }
      if (parseMajor(deps[dep]) !== EXPECTED_REACT_MAJOR) {
        console.error(
          `[export-screen] ERROR: ${field}.${dep} is "${deps[dep]}", but WebGAL requires React ${EXPECTED_REACT_MAJOR}.x.`,
        );
        process.exit(1);
      }
    }
  }

  if (pkg.dependencies && ('react' in pkg.dependencies || 'react-dom' in pkg.dependencies)) {
    console.error('[export-screen] ERROR: Do not place react or react-dom in runtime dependencies.');
    process.exit(1);
  }

  for (const dep of ['react', 'react-dom']) {
    const installedPkgPath = path.join(PROJECT_ROOT, 'node_modules', dep, 'package.json');
    if (fs.existsSync(installedPkgPath)) {
      const installedPkg = JSON.parse(fs.readFileSync(installedPkgPath, 'utf8'));
      if (typeof installedPkg.version === 'string' && !installedPkg.version.startsWith(`${EXPECTED_REACT_MAJOR}.`)) {
        console.error(
          `[export-screen] ERROR: Installed ${dep}@${installedPkg.version} in node_modules is incompatible with WebGAL React ${EXPECTED_REACT_MAJOR}.x.`,
        );
        process.exit(1);
      }
    }
  }

  const lockPath = path.join(PROJECT_ROOT, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    for (const dep of ['react', 'react-dom']) {
      const installed = lock.packages?.[`node_modules/${dep}`]?.version ?? lock.dependencies?.[dep]?.version;
      if (installed && !installed.startsWith(`${EXPECTED_REACT_MAJOR}.`)) {
        console.error(
          `[export-screen] ERROR: Installed ${dep}@${installed} in package-lock.json is incompatible with WebGAL React ${EXPECTED_REACT_MAJOR}.x.`,
        );
        process.exit(1);
      }
    }
  }
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZipBuffer(entries) {
  const localChunks = [];
  const centralChunks = [];
  let offset = 0;

  for (const { archivePath, data } of entries) {
    const nameBuf = Buffer.from(archivePath.replace(/\\/g, '/'), 'utf8');
    const compressed = zlib.deflateRawSync(data);
    const checksum = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localChunks.push(localHeader, nameBuf, compressed);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralChunks.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralDir = Buffer.concat(centralChunks);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localChunks, centralDir, eocd]);
}

function collectFiles(dirPath, prefix) {
  if (!fs.existsSync(dirPath)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, rel));
    } else {
      results.push({ archivePath: rel, data: fs.readFileSync(full) });
    }
  }
  return results;
}

function main() {
  verifyReactVersion();

  if (!process.argv.includes('--skip-build')) {
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execFileSync(npx, ['vite', 'build'], { stdio: 'inherit', shell: process.platform === 'win32' });
  }

  const manifestPath = path.join(PROJECT_ROOT, 'webgal-screen.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const entryJsPath = path.join(PROJECT_ROOT, 'dist', 'index.js');
  if (!fs.existsSync(entryJsPath)) {
    console.error('[export-screen] ERROR: dist/index.js not found after build.');
    process.exit(1);
  }

  const entries = [
    { archivePath: 'index.js', data: fs.readFileSync(entryJsPath) },
    { archivePath: 'webgal-screen.json', data: fs.readFileSync(manifestPath) },
  ];

  const stylePath = path.join(PROJECT_ROOT, 'src', 'style.scss');
  if (fs.existsSync(stylePath)) {
    entries.push({ archivePath: 'style.scss', data: fs.readFileSync(stylePath) });
  }
  entries.push(...collectFiles(path.join(PROJECT_ROOT, 'src', 'assets'), 'assets'));

  const outDir = path.join(PROJECT_ROOT, 'dist-export');
  fs.mkdirSync(outDir, { recursive: true });
  const zipName = `${manifest.screen}-${manifest.variantId}.zip`;
  const zipPath = path.join(outDir, zipName);
  fs.writeFileSync(zipPath, buildZipBuffer(entries));

  console.log(`[export-screen] Exported ${zipPath} (${entries.length} files).`);
}

main();
