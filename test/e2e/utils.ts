/**
 * WebGAL E2E Test Utilities
 *
 * Encapsulates browser interaction patterns for WebGAL testing.
 * Extracted from TDD verification scripts.
 */
import type { Page } from 'playwright-chromium'

/**
 * Navigate through WebGAL title screen to start the game.
 *
 * Steps:
 * 1. Click the overlay `.html-body__title-enter`
 * 2. Select language (click matching button)
 * 3. Click "开始游戏" (must target inner leaf element)
 */
export async function startGame(page: Page, lang = '简体中文'): Promise<void> {
  // Click title overlay
  await page.evaluate(() => {
    const overlay = document.querySelector('.html-body__title-enter') as HTMLElement
    overlay?.click()
  })
  await page.waitForSelector('div[class*="langSelectButton"]', { state: 'visible' })

  // Select language
  await page.evaluate((lang) => {
    const buttons = document.querySelectorAll('div[class*="langSelectButton"]')
    for (const btn of buttons) {
      if (btn.textContent?.includes(lang)) {
        (btn as HTMLElement).click()
        return
      }
    }
  }, lang)
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('*')).some(
      (el) => el.textContent?.trim() === '开始游戏' && el.children.length === 0,
    ),
  )

  // Click "开始游戏" — must target leaf element
  await page.evaluate(() => {
    const all = document.querySelectorAll('*')
    for (const el of all) {
      if (el.textContent?.trim() === '开始游戏' && el.children.length === 0) {
        (el as HTMLElement).click()
        return
      }
    }
  })
  await page.waitForSelector('div[class*="_text_"]', { state: 'visible' })
}

/**
 * Get current dialog text from the TextBox.
 * WebGAL renders text in 3 layers (original + outer stroke + inner fill),
 * so "Line 1" appears as "LineLineLine   111" in textContent.
 */
export async function getText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const el = document.querySelector('div[class*="_text_"]')
    return el?.textContent ?? ''
  })
}

/**
 * Access Redux store via React fiber tree.
 * Store is not on window — it's in module scope, accessible through
 * React's internal fiber tree at depth ~3.
 */
export async function getStore(page: Page): Promise<any> {
  return page.evaluate(() => {
    const rootEl = document.getElementById('root')
    if (!rootEl) return null

    const fiberKey = Object.keys(rootEl).find((k) => k.startsWith('__react'))
    if (!fiberKey) return null

    // BFS through fiber tree to find store
    const queue: any[] = [(rootEl as any)[fiberKey]]
    for (let depth = 0; depth < 10 && queue.length > 0; depth++) {
      const size = queue.length
      for (let i = 0; i < size; i++) {
        const node = queue.shift()
        if (!node) continue
        if (node.memoizedProps?.store) {
          return node.memoizedProps.store.getState()
        }
        if (node.child) queue.push(node.child)
        if (node.sibling) queue.push(node.sibling)
      }
    }
    return null
  })
}

/**
 * Click to advance dialog.
 */
export async function clickToAdvance(page: Page): Promise<void> {
  const before = await getText(page)
  await page.evaluate(() => {
    const textbox = document.querySelector('div[class*="textBox_"]') as HTMLElement
    textbox?.click()
  })
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector('div[class*="_text_"]')
      return el?.textContent !== prev
    },
    before,
    { timeout: 5000 },
  ).catch(() => {})
}
