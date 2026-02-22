import type { TestProject } from 'vitest/node'
import type { BrowserServer } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'

let browserServer: BrowserServer | undefined

export async function setup({ provide }: TestProject): Promise<void> {
  browserServer = await chromium.launchServer({
    headless: !process.env.WEBGAL_DEBUG,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined,
  })
  provide('wsEndpoint', browserServer.wsEndpoint())
}

export async function teardown(): Promise<void> {
  await browserServer?.close()
}

declare module 'vitest' {
  export interface ProvidedContext {
    wsEndpoint: string
  }
}
