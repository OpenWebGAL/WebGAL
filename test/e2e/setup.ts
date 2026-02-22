import type { Browser, Page } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'
import { beforeAll, inject } from 'vitest'
import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import path from 'node:path'

export let browser: Browser
export let page: Page

let devServer: ChildProcess | undefined
let devServerUrl: string

async function startDevServer(): Promise<string> {
  const root = path.resolve(__dirname, '../../packages/webgal')

  return new Promise((resolve, reject) => {
    devServer = spawn('npx', ['vite', '--host', '--port', '3099'], {
      cwd: root,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' },
    })

    const timeout = setTimeout(() => reject(new Error('Dev server start timeout')), 30_000)

    devServer.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      const match = output.match(/Local:\s+(https?:\/\/[^\s]+)/)
      if (match) {
        clearTimeout(timeout)
        resolve(match[1])
      }
    })

    devServer.stderr?.on('data', (data: Buffer) => {
      if (process.env.WEBGAL_DEBUG) {
        console.error('[vite]', data.toString())
      }
    })

    devServer.on('error', (err) => {
      clearTimeout(timeout)
      reject(err)
    })
  })
}

beforeAll(async () => {
  const wsEndpoint = inject('wsEndpoint')
  browser = await chromium.connect(wsEndpoint)
  page = await browser.newPage()

  devServerUrl = await startDevServer()

  return async () => {
    await page?.close()
    await browser?.close()
    devServer?.kill()
  }
})

export { devServerUrl }
