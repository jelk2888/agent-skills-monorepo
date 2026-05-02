/**
 * Gemini 批量图片生成模块
 *
 * 功能：
 * - 自动连接 Gemini 并检测登录状态
 * - 批量生成图片并保存到指定目录
 * - 支持自动重试和优雅关闭
 * - 保留登录状态以便后续使用
 *
 * 使用方法：
 *   const { batchGenerate } = require('./gemini_batch_gen')
 *   await batchGenerate([
 *     { prompt: '描述1', outputName: 'image1.png' },
 *     { prompt: '描述2', outputName: 'image2.png' }
 *   ], 'output/directory')
 */

const fs = require('fs')
const path = require('path')

// --- 配置 ---
const CONFIG = {
  // 环境变量配置
  BROWSER_USER_DATA_DIR: process.env.BROWSER_USER_DATA_DIR || path.join(__dirname, '../../../gemini-web-data'),
  BROWSER_HEADLESS: process.env.BROWSER_HEADLESS || 'false',
  BROWSER_DEBUG_PORT: parseInt(process.env.BROWSER_DEBUG_PORT || '9222'),

  // 超时配置
  WAIT_BETWEEN_ITEMS: 10000,
  WAIT_AFTER_DELETE: 5000,
  WAIT_AFTER_DOWNLOAD: 2000,
  GENERATE_TIMEOUT: 240000,
  FIRST_CHECK_TIMEOUT: 30000,
  RETRY_CHECK_TIMEOUT: 30000,
  RETRY_COUNT: 10,
  POLL_INTERVAL: 4000,
  MIN_FILE_SIZE: 50000,

  // 路径配置
  SKILL_PATH: process.env.GEMINI_SKILL_PATH || path.join(__dirname, '../../../gemini-skill'),
  DOWNLOAD_DIR: process.env.GEMINI_DOWNLOAD_DIR || path.join(__dirname, '../../../gemini-skill/gemini-image')
}

// --- 工具函数 ---
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function fileExists(filepath) {
  try {
    fs.accessSync(filepath)
    return true
  } catch {
    return false
  }
}

function getExistingFiles(dir, ext = '.png') {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith(ext))
  } catch {
    return []
  }
}

function getFileSize(filepath) {
  return fs.statSync(filepath).size
}

function moveFile(src, dest) {
  if (fileExists(src)) {
    fs.copyFileSync(src, dest)
    fs.unlinkSync(src)
    return true
  }
  return false
}

// --- 浏览器管理 ---
let browserModule = null
let globalOps = null

async function ensureBrowser() {
  if (browserModule && globalOps) {
    return { browserModule, ops: globalOps }
  }

  const indexPath = path.join(CONFIG.SKILL_PATH, 'src/index.js')
  const moduleExports = await import(indexPath)
  browserModule = moduleExports
  const { ops } = await browserModule.createGeminiSession()
  globalOps = ops

  console.log('[browser] ✅ 已连接 Gemini')
  return { browserModule, ops: globalOps }
}

// --- 登录检测 ---
async function checkGeminiLogin(ops) {
  console.log('[login] 🔍 检测 Gemini 登录状态...')

  try {
    const loginResult = await ops.checkLogin()
    console.log(`[login] ops.checkLogin() → ${JSON.stringify(loginResult)}`)

    if (loginResult.ok && loginResult.loggedIn) {
      console.log('[login] ✅ Gemini 已登录（内置检测）')
      return true
    }

    if (!loginResult.ok) {
      try {
        const probeResult = await ops.probe()
        console.log(`[login] ops.probe() → newChatBtn=${probeResult.newChatBtn}, promptInput=${probeResult.promptInput}`)
        if (probeResult.newChatBtn || probeResult.promptInput) {
          console.log('[login] ✅ Gemini 已登录（元素探测）')
          return true
        }
      } catch (e) {
        console.log(`[login] ⚠️ probe 失败: ${e.message}`)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('[login] ❌ Gemini 未登录！')
    console.log('='.repeat(60))
    console.log('  请在弹出的浏览器窗口中登录 Google 账号')
    console.log('  登录完成后脚本会自动继续...')
    console.log('  等待最长 5 分钟...\n')

    const maxWaitMs = 5 * 60 * 1000
    const checkInterval = 5000
    const start = Date.now()

    while (Date.now() - start < maxWaitMs) {
      await sleep(checkInterval)
      try {
        const recheck = await ops.checkLogin()
        if (recheck.ok && recheck.loggedIn) {
          const elapsed = Math.round((Date.now() - start) / 1000)
          console.log(`\n[login] ✅ 检测到登录成功！耗时 ${elapsed} 秒`)
          return true
        }

        const urlCheck = await ops.operator.query(() => ({
          url: window.location.href,
          isLoginPage: window.location.href.includes('accounts.google.com'),
          hasNewChat: !!document.querySelector('[data-test-id="new-chat-button"], [aria-label*="new chat" i]'),
        }))
        if (!urlCheck.isLoginPage && urlCheck.hasNewChat) {
          const elapsed = Math.round((Date.now() - start) / 10