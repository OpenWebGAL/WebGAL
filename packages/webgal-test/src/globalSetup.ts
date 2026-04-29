/**
 * vitest globalSetup
 *
 * 流程：
 * 1. 检查 WebGAL 测试构建产物是否存在（packages/webgal/dist）
 * 2. 若不存在，自动执行 build:test 构建
 * 3. 启动内建静态服务器，在固定端口服务 dist
 * 4. 测试结束后停止服务器
 *
 * CI 用法：
 *   先 yarn build:test，再 yarn test:integration（跳过构建直接起服务）
 * 本地用法：
 *   直接 yarn test:integration（自动触发构建）
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.WEBGAL_TEST_PORT) || 4173;

let server: import('node:http').Server | null = null;

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      files.push(...listFiles(filePath));
    } else {
      files.push(filePath);
    }
  }
  return files;
}

function hasTestExposureInBundle(distDir: string): boolean {
  const bundleFiles = listFiles(distDir).filter((file) => ['.js', '.mjs', '.html'].includes(extname(file)));
  return bundleFiles.some((file) => {
    const content = readFileSync(file, 'utf8');
    return content.includes('webgalTest') && content.includes('WebGAL Test Mode Active');
  });
}

function buildTestBundle(rootDir: string): void {
  execSync('yarn parser:build && yarn webgal:build:test', {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

export async function setup() {
  const testPkgDir = resolve(__dirname, '..');
  const rootDir = resolve(testPkgDir, '../..');
  const webgalDist = resolve(rootDir, 'packages/webgal/dist');

  const forceBuild = process.env.WEBGAL_TEST_FORCE_BUILD === 'true';
  const skipBuild = process.env.WEBGAL_TEST_SKIP_BUILD === 'true';
  const hasDist = existsSync(webgalDist);
  const hasTestExposure = hasDist && hasTestExposureInBundle(webgalDist);

  // dist 可能来自普通生产构建；必须确认测试 API 真在构建产物中。
  if (forceBuild || !hasDist || !hasTestExposure) {
    if (skipBuild) {
      const reason = !hasDist
        ? 'WebGAL test dist not found at '
        : 'WebGAL dist exists but does not contain the test API exposure at ';
      throw new Error(reason + webgalDist + '\nRun `yarn build:test` at the project root first.');
    }
    if (!hasDist) {
      console.log('\nWebGAL dist not found, building in test mode...');
    } else if (!hasTestExposure) {
      console.log('\nWebGAL dist is not a test-mode bundle, rebuilding...');
    } else {
      console.log('\nWEBGAL_TEST_FORCE_BUILD=true, rebuilding test bundle...');
    }
    buildTestBundle(rootDir);
  }

  if (!existsSync(webgalDist)) {
    throw new Error('WebGAL dist still not found after build. Check build logs.');
  }

  if (!hasTestExposureInBundle(webgalDist)) {
    if (process.env.WEBGAL_TEST_SKIP_BUILD === 'true') {
      throw new Error(
        'WebGAL dist does not contain window.webgalTest exposure at ' +
          webgalDist +
          '\nRun `yarn build:test` at the project root first.',
      );
    }
    throw new Error('WebGAL dist still does not expose window.webgalTest after build. Check build logs.');
  }

  // 启动静态服务器
  server = await startServer(webgalDist, PORT);
  const address = server.address();
  const actualPort = typeof address === 'object' && address ? address.port : PORT;
  const url = `http://localhost:${actualPort}`;
  console.log(`\nServing WebGAL test dist at ${url}`);

  // 传递给 test worker（vitest forks 继承父进程环境变量）
  process.env.WEBGAL_TEST_URL = url;
}

export async function teardown() {
  if (server) {
    server.close();
    console.log('\n🛑 Static server stopped.');
  }
}
