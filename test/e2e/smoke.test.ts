import { describe, expect, it } from 'vitest'
import { page } from './setup'
import { devServerUrl } from './setup'

describe('WebGAL E2E smoke test', () => {
  it('should load the title screen', async () => {
    await page.goto(devServerUrl)
    await page.waitForSelector('.html-body__title-enter', { state: 'visible' })

    const hasOverlay = await page.evaluate(() => {
      return !!document.querySelector('.html-body__title-enter')
    })
    expect(hasOverlay).toBe(true)
  })
})
