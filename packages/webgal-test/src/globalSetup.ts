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
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = Number(process.env.WEBGAL_TEST_PORT) || 4173;

let server: import('node:http').Server | null = null;

export async function setup() {
  const testPkgDir = resolve(__dirname, '..');
  const rootDir = resolve(testPkgDir, '../..');
  const webgalDist = resolve(rootDir, 'packages/webgal/dist');

  // 如果 dist 不存在且没有设置 WEBGAL_TEST_SKIP_BUILD，自动构建
  if (!existsSync(webgalDist)) {
    if (process.env.WEBGAL_TEST_SKIP_BUILD === 'true') {
      throw new Error(
        'WebGAL test dist not found at ' +
          webgalDist +
          '\nRun `yarn build:test` at the project root first.',
      );
    }
    console.log('\n📦 WebGAL dist not found, building in test mode...');
    execSync('yarn parser:build && yarn webgal:build:test', {
      cwd: rootDir,
      stdio: 'inherit',
    });
  }

  if (!existsSync(webgalDist)) {
    throw new Error('WebGAL dist still not found after build. Check build logs.');
  }

  // 启动静态服务器
  server = await startServer(webgalDist, PORT);
  const url = `http://localhost:${PORT}`;
  console.log(`\n🌐 Serving WebGAL dist at ${url}`);

  // 传递给 test worker（vitest forks 继承父进程环境变量）
  process.env.WEBGAL_TEST_URL = url;
}

export async function teardown() {
  if (server) {
    server.close();
    console.log('\n🛑 Static server stopped.');
  }
}
