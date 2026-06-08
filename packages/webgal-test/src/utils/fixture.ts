/**
 * WebGAL 测试 - 浏览器生命周期管理
 *
 * 提供 playwright 浏览器和页面的共享管理
 */
import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { waitForTestAPI, delay } from './bridge';

const WEBGAL_URL = process.env.WEBGAL_TEST_URL ?? 'http://localhost:4173';

let _browser: Browser | null = null;

/**
 * 获取（或懒启动）共享的 chromium 浏览器实例
 */
export async function getBrowser(): Promise<Browser> {
  if (!_browser) {
    _browser = await chromium.launch({
      headless: process.env.WEBGAL_TEST_HEADLESS !== 'false',
    });
  }
  return _browser;
}

/**
 * 创建一个新的测试页面，导航到 WebGAL 并等待测试 API 就绪
 */
export async function createTestPage(): Promise<Page> {
  const browser = await getBrowser();
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  await page.goto(WEBGAL_URL, { waitUntil: 'domcontentloaded' });
  await waitForTestAPI(page, 30_000);
  await page.waitForSelector('#FullScreenClick', { timeout: 30_000 });
  const metadata = await page.evaluate(() => window.webgalTest?.metadata);
  if (!metadata?.testMode) {
    throw new Error('window.webgalTest is present but test metadata is missing.');
  }
  return page;
}

/**
 * 在测试页面上开始游戏并等待场景初始化
 */
export async function startGameAndWait(page: Page, settleMs = 2000): Promise<void> {
  await page.evaluate(() => window.webgalTest!.controllers.startGame());
  await delay(settleMs);
}

/**
 * 关闭共享浏览器
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}
