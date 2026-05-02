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
  BROWSER_USER_DATA_DIR: process.env.BROWSER_USER_DATA_DIR || path.join(__dirname, '../../gemini-web-data'),
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
          const elapsed = Math.round((Date.now() - start) / 1000)
          console.log(`\n[login] ✅ 检测到登录成功！耗时 ${elapsed} 秒`)
          return true
        }

        const waited = Math.round((Date.now() - start) / 1000)
        process.stdout.write(`\r[login] ⏳ 等待登录中... (${waited}s / 300s)     `)
      } catch (e) {
        process.stdout.write('.')
      }
    }

    console.log('\n\n[login] ⏰ 等待超时（5 分钟），尝试继续（可能仍无法生图）')
    return false
  } catch (e) {
    console.log(`[login] ⚠️ 登录检测异常: ${e.message}，尝试继续...`)
    return true
  }
}

// --- 优雅关闭 ---
async function gracefulShutdown(module) {
  console.log('[shutdown] 🔄 正在优雅关闭浏览器（保留登录状态）...')

  try {
    if (module && module.disconnect) {
      module.disconnect()
      console.log('[shutdown] ✅ 已断开 Skill 连接')
    }
  } catch (e) {
    console.log(`[shutdown] ⚠️ 断开连接异常: ${e.message}`)
  }

  try {
    const http = await import('http')
    await new Promise((resolve) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 40225,
        path: '/browser/release',
        method: 'POST',
        timeout: 10000,
      }, (res) => {
        let body = ''
        res.on('data', chunk => body += chunk)
        res.on('end', () => {
          console.log(`[shutdown] Daemon 响应: ${body}`)
          resolve()
        })
      })
      req.on('error', (e) => {
        console.log(`[shutdown] ⚠️ Daemon 请求失败: ${e.message}（可能已关闭）`)
        resolve()
      })
      req.on('timeout', () => {
        req.destroy()
        console.log('[shutdown] ⚠️ Daemon 请求超时')
        resolve()
      })
      req.end()
    })
    console.log('[shutdown] ✅ 已通过 Daemon 优雅关闭浏览器，Cookie 和登录状态已保存')
  } catch (e) {
    console.log(`[shutdown] ⚠️ 优雅关闭异常: ${e.message}`)
  }

  await sleep(3000)
}

// --- 文件检测 ---
async function checkFileReady(filePath) {
  if (!fileExists(filePath)) return false
  try {
    let size = getFileSize(filePath)
    if (size < CONFIG.MIN_FILE_SIZE) return false

    await sleep(2000)
    let size2 = getFileSize(filePath)
    if (size !== size2) {
      console.log(`    📥 下载中... ${(size / 1024).toFixed(1)}KB → ${(size2 / 1024).toFixed(1)}KB`)
      size = size2
      await sleep(2000)
      size2 = getFileSize(filePath)
      if (size !== size2) {
        console.log(`    📥 下载中... ${(size2 / 1024).toFixed(1)}KB`)
        return false
      }
    }

    await sleep(2000)
    const size3 = getFileSize(filePath)
    if (size !== size3) {
      console.log(`    📥 下载中... ${(size3 / 1024).toFixed(1)}KB`)
      return false
    }

    console.log(`    ✅ 文件下载完成: ${(size3 / 1024).toFixed(1)}KB`)
    return true
  } catch {
    return false
  }
}

async function waitForNewFile(originalFiles, extension = '.png', onProgress, ops = null, finalPrompt = null) {
  let retryRound = 0

  while (retryRound < CONFIG.RETRY_COUNT) {
    retryRound++
    const phaseStart = Date.now()
    const timeout = retryRound === 1 ? CONFIG.FIRST_CHECK_TIMEOUT : CONFIG.RETRY_CHECK_TIMEOUT
    const phaseName = retryRound === 1 ? '第一阶段' : `重试${retryRound - 1}`

    console.log(`\n    📊 [${phaseName}] 检测超时: ${timeout / 1000}秒`)

    while (Date.now() - phaseStart < timeout) {
      try {
        const currentFiles = fs.readdirSync(CONFIG.DOWNLOAD_DIR)
          .filter(f => f.endsWith(extension))
          .map(f => path.join(CONFIG.DOWNLOAD_DIR, f))

        const newFiles = currentFiles.filter(f => !originalFiles.includes(f))

        for (const file of newFiles) {
          if (await checkFileReady(file)) {
            console.log(`\n    ✅ 检测到新图片: ${path.basename(file)}`)
            return file
          }
        }

        const elapsed = Math.round((Date.now() - phaseStart) / 1000)
        const totalElapsed = Math.round((Date.now() - (phaseStart - (retryRound - 1) * timeout)) / 1000)
        onProgress?.(totalElapsed, retryRound)

        if (elapsed % 30 === 0 && elapsed > 0) {
          console.log(`    ⏳ 已等待 ${totalElapsed} 秒 (第${retryRound}轮)...`)
        }
      } catch (e) {
        console.log(`    ⚠️ 检测异常: ${e.message}`)
      }
      await sleep(CONFIG.POLL_INTERVAL)
    }

    console.log(`\n    ⏰ [${phaseName}] 超时(${timeout / 1000}秒)，进入下一轮检测...`)

    if (retryRound < CONFIG.RETRY_COUNT) {
      console.log(`    ⏳ 等待 10 秒后继续检测...`)
      await sleep(10000)
    }
  }

  console.log(`\n    ❌ 已重试${CONFIG.RETRY_COUNT}轮，仍未检测到图片`)
  return null
}

async function checkExistingImage(originalFiles, extension = '.png') {
  try {
    const currentFiles = fs.readdirSync(CONFIG.DOWNLOAD_DIR)
      .filter(f => f.endsWith(extension))
      .map(f => path.join(CONFIG.DOWNLOAD_DIR, f))

    const newFiles = currentFiles.filter(f => !originalFiles.includes(f))

    for (const file of newFiles) {
      if (await checkFileReady(file)) {
        return file
      }
    }
    return null
  } catch {
    return null
  }
}

// --- 检测并下载图片 ---
async function detectAndDownloadImage(originalFiles, ops, finalPrompt) {
  let detectCount = 0
  const maxDetect = 3
  let savedFile = null

  while (detectCount < maxDetect && !savedFile) {
    detectCount++
    console.log(`  🔍 检测第 ${detectCount}/${maxDetect} 次...`)

    console.log(`  🔄 刷新当前页面...`)
    try {
      await ops.operator.query(() => { location.reload() })
      console.log(`  🔄 页面已刷新，等待 10 秒...`)
      await sleep(10000)
    } catch (e) {
      console.log(`  ⚠️ 刷新失败: ${e.message}`)
    }

    console.log(`  🔍 检测当前对话是否为空...`)
    let hasConversation = false
    try {
      hasConversation = await ops.operator.query(() => {
        const userQueryElements = document.querySelectorAll('[class*="user-query"]')
        return userQueryElements.length > 0
      })
      console.log(`  💬 对话状态: ${hasConversation ? '有对话' : '空白对话'}`)
    } catch (e) {
      console.log(`  ⚠️ 检测对话失败: ${e.message}`)
    }

    if (!hasConversation) {
      console.log(`  📝 对话为空，调用 generateImage 重新生成...`)
      try {
        const result = await ops.generateImage(finalPrompt, {
          timeout: CONFIG.GENERATE_TIMEOUT,
          fullSize: true
        })
        console.log(`  🤖 generateImage 结果: ${result.ok ? '成功' : result.error}`)

        if (result.ok) {
          console.log(`  ⏳ 等待图片下载完成...`)
          savedFile = await waitForNewFile(originalFiles, '.png', (elapsed, round) => {
            if (elapsed % 30 === 0 && round) console.log(`    已等待 ${elapsed} 秒 (第${round}轮)...`)
          }, ops, finalPrompt)
          if (savedFile) {
            console.log(`  ✅ 检测到已下载的图片: ${path.basename(savedFile)}`)
            return savedFile
          }
        } else {
          console.log(`  ⚠️ generateImage 失败: ${result.error}`)
        }
      } catch (e) {
        console.log(`  ⚠️ generateImage 失败: ${e.message}`)
      }
    } else {
      console.log(`  💬 有对话，调用 getLatestImage 检测图片...`)
      let imgInfo = null
      try {
        imgInfo = await ops.getLatestImage()
        console.log(`  📷 getLatestImage 结果: ${JSON.stringify(imgInfo)}`)
      } catch (e) {
        console.log(`  ⚠️ getLatestImage 失败: ${e.message}`)
      }

      if (imgInfo && imgInfo.ok) {
        console.log(`  ✅ 检测到页面上有图片，准备下载...`)
        let dlResult = null
        try {
          dlResult = await ops.downloadFullSizeImage({ index: imgInfo.index })
          console.log(`  📥 downloadFullSizeImage 结果: ${JSON.stringify(dlResult)}`)
        } catch (e) {
          console.log(`  ⚠️ downloadFullSizeImage 失败: ${e.message}`)
        }

        if (dlResult && (dlResult.ok || dlResult.error === 'download_timeout')) {
          console.log(`  ⏳ 等待图片下载完成...`)
          savedFile = await waitForNewFile(originalFiles, '.png', (elapsed, round) => {
            if (elapsed % 30 === 0 && round) console.log(`    已等待 ${elapsed} 秒 (第${round}轮)...`)
          }, ops, finalPrompt)
          if (savedFile) {
            console.log(`  ✅ 检测到已下载的图片: ${path.basename(savedFile)}`)
          }
        }
      } else {
        console.log(`  ⚠️ 有对话但没有图片，等待 10 秒后重试...`)
        let retryCount = 0
        const maxRetry = 5
        while (retryCount < maxRetry && !imgInfo?.ok) {
          retryCount++
          console.log(`  🔄 重试第 ${retryCount}/${maxRetry} 次...`)
          await sleep(10000)
          try {
            imgInfo = await ops.getLatestImage()
            console.log(`  📷 getLatestImage 结果: ${JSON.stringify(imgInfo)}`)
          } catch (e) {
            console.log(`  ⚠️ getLatestImage 失败: ${e.message}`)
          }
        }

        if (imgInfo && imgInfo.ok) {
          console.log(`  ✅ 检测到页面上有图片，准备下载...`)
          let dlResult = null
          try {
            dlResult = await ops.downloadFullSizeImage({ index: imgInfo.index })
            console.log(`  📥 downloadFullSizeImage 结果: ${JSON.stringify(dlResult)}`)
          } catch (e) {
            console.log(`  ⚠️ downloadFullSizeImage 失败: ${e.message}`)
          }

          if (dlResult && (dlResult.ok || dlResult.error === 'download_timeout')) {
            console.log(`  ⏳ 等待图片下载完成...`)
            savedFile = await waitForNewFile(originalFiles, '.png', (elapsed, round) => {
              if (elapsed % 30 === 0 && round) console.log(`    已等待 ${elapsed} 秒 (第${round}轮)...`)
            }, ops, finalPrompt)
            if (savedFile) {
              console.log(`  ✅ 检测到已下载的图片: ${path.basename(savedFile)}`)
            }
          }
        } else {
          console.log(`  ⚠️ 重试${maxRetry}次后仍没有图片`)
        }
      }
    }

    if (!savedFile && detectCount < maxDetect) {
      console.log(`  ⏰ 未检测到图片，继续...`)
    }
  }

  return savedFile
}

// --- 删除会话 ---
async function deleteCurrentSession(ops) {
  let deleteSuccess = false

  try {
    const result = await ops.operator.query(() => {
      const menuBtns = document.querySelectorAll('button[aria-label="打开对话操作菜单。"]')
      if (menuBtns.length === 0) {
        return { found: false, reason: 'no_menu_button' }
      }
      menuBtns[0].click()
      return { found: true, menuCount: menuBtns.length }
    })

    if (!result || !result.found) {
      console.log('  ⚠️ 未找到对话操作菜单按钮')
      return false
    }

    await sleep(800)

    const deleteResult = await ops.operator.query(() => {
      const menus = document.querySelectorAll('[role="menu"], [role="menuitem"]')
      for (const menu of menus) {
        const visible = menu.offsetWidth > 0 && menu.offsetHeight > 0
        if (visible) {
          const deleteBtns = menu.querySelectorAll('button, [role="menuitem"]')
          for (const btn of deleteBtns) {
            const text = btn.textContent?.trim() || ''
            if (text === '删除') {
              btn.click()
              return { deleted: true }
            }
          }
        }
      }
      return { deleted: false }
    })

    if (!deleteResult || !deleteResult.deleted) {
      console.log('  ⚠️ 未找到删除菜单项')
      return false
    }

    console.log('  ⏳ 等待确认对话框...')
    await sleep(500)

    const confirmed = await ops.operator.query(() => {
      const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"], [aria-label*="删除"]')
      for (const dialog of dialogs) {
        const visible = dialog.offsetWidth > 0 && dialog.offsetHeight > 0
        if (visible) {
          const btns = dialog.querySelectorAll('button, [role="button"]')
          for (const btn of btns) {
            const text = (btn.textContent || '').trim()
            if (text === '删除' || text === '确认' || text === '确定') {
              btn.click()
              return { confirmed: true, buttonText: text }
            }
          }
          const spans = dialog.querySelectorAll('span')
          for (const span of spans) {
            const text = (span.textContent || '').trim()
            if (text === '删除' || text === '确认' || text === '确定') {
              const parent = span.closest('button, [role="button"]')
              if (parent) {
                parent.click()
                return { confirmed: true, buttonText: text }
              }
            }
          }
        }
      }
      return { confirmed: false }
    })

    if (confirmed && confirmed.confirmed) {
      console.log(`  ✅ 已点击确认: "${confirmed.buttonText}"`)
    } else {
      console.log('  ⚠️ 未找到确认按钮，尝试其他方式...')
      await ops.operator.query(() => {
        const allBtns = document.querySelectorAll('button')
        for (const btn of allBtns) {
          const text = (btn.textContent || '').trim()
          const ariaLabel = (btn.getAttribute('aria-label') || '').trim()
          if ((text === '删除' || ariaLabel.includes('删除')) && btn.offsetWidth > 0) {
            btn.click()
            return true
          }
        }
        return false
      })
    }

    console.log('  ⏳ 等待删除完成...')
    for (let i = 0; i < 20; i++) {
      await sleep(500)

      const deleteCheck = await ops.operator.query(() => {
        const chatMessages = document.querySelectorAll('[data-message-author-role="assistant"]')
        const menuVisible = Array.from(document.querySelectorAll('[role="menu"]')).some(m => m.offsetWidth > 0)
        const dialogVisible = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]')).some(d => d.offsetWidth > 0)

        return { messagesCount: chatMessages.length, menuVisible, dialogVisible }
      })

      if (deleteCheck && deleteCheck.messagesCount === 0 && !deleteCheck.dialogVisible) {
        deleteSuccess = true
        break
      }
    }

    if (deleteSuccess) {
      console.log('  🗑️ 会话已删除')
      return true
    } else {
      console.log('  ⚠️ 删除超时，但仍继续')
      return true
    }
  } catch (e) {
    console.log(`  ⚠️ 删除会话失败: ${e.message}`)
    return false
  }
}

// --- 主批量生成函数 ---
async function batchGenerate(items, outputDir, options = {}) {
  const {
    skipExisting = true,
    autoShutdown = true,
    onProgress = null,
    onError = null
  } = options

  console.log(`\n📋 将生成 ${items.length} 个项目`)
  items.forEach((cfg, i) => {
    const prompt = cfg.prompt.length > 60 ? cfg.prompt.substring(0, 60) + '...' : cfg.prompt
    console.log(`  ${i + 1}. [image] ${prompt}`)
  })

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 批量生成 ${items.length} 个项目`)
  console.log(`📁 输出目录: ${outputDir}`)
  console.log(`${'='.repeat(60)}\n`)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const existingFiles = getExistingFiles(outputDir)
  console.log(`📂 目标目录已有 ${existingFiles.length} 张图片`)

  const toGenerate = []
  const skipped = []

  for (let i = 0; i < items.length; i++) {
    const cfg = items[i]
    const destPath = path.join(outputDir, cfg.outputName)
    if (skipExisting && fileExists(destPath)) {
      skipped.push({ ...cfg, originalIndex: i + 1 })
    } else {
      toGenerate.push({ ...cfg, originalIndex: i + 1 })
    }
  }

  console.log(`📋 需生成 ${toGenerate.length} 张图片\n`)

  if (skipped.length > 0) {
    skipped.forEach(s => {
      console.log(`  ⏭️ 跳过 [${s.originalIndex}] ${s.outputName} (已存在)`)
    })
    console.log('')
  }

  if (toGenerate.length === 0) {
    console.log('✅ 所有图片已存在，无需生成!')
    if (autoShutdown && browserModule) {
      await gracefulShutdown(browserModule)
    }
    return { success: 0, skipped: skipped.length, total: items.length }
  }

  console.log('[browser] 🔄 正在连接 Gemini...')
  const { browserModule: module, ops } = await ensureBrowser()
  const isLoggedIn = await checkGeminiLogin(ops)
  if (!isLoggedIn) {
    console.log('[login] ⚠️ Gemini 可能未登录，生图可能失败，但继续尝试...\n')
  }

  let successCount = 0

  for (let i = 0; i < toGenerate.length; i++) {
    const cfg = toGenerate[i]
    const prompt = cfg.prompt.length > 40 ? cfg.prompt.substring(0, 40) + '...' : cfg.prompt

    console.log(`\n${'─'.repeat(60)}`)
    console.log(`📦 ${cfg.originalIndex}/${items.length} [image] ${prompt}`)
    console.log(`${'─'.repeat(60)}`)

    let success = false
    let currentSessionCreated = false

    for (let attempt = 1; attempt <= 3 && !success; attempt++) {
      try {
        const originalFiles = getExistingFiles(CONFIG.DOWNLOAD_DIR).map(f => path.join(CONFIG.DOWNLOAD_DIR, f))

        if (attempt > 1 || !currentSessionCreated) {
          console.log(`  [1/5] 新建会话...`)
          await ops.click('newChatBtn')
          await sleep(5000)
          currentSessionCreated = true
        }

        console.log(`  [2/5] 切换到快速模式...`)
        try {
          const switchResult = await ops.switchToModel('quick')
          if (switchResult.ok) {
            console.log(`  🤖 已切换到快速模式`)
          } else {
            console.log(`  ⚠️ 切换模式失败: ${switchResult.error}，继续生成`)
          }
        } catch (e) {
          console.log(`  ⚠️ 切换模式异常: ${e.message}，继续生成`)
        }

        const finalPrompt = '帮我生成图片: ' + cfg.prompt

        console.log(`  [3/5] 发送提示词生成图片...`)
        let result = await ops.generateImage(finalPrompt, {
          timeout: CONFIG.GENERATE_TIMEOUT,
          fullSize: true
        })

        console.log(`  [4/5] 检测网页是否已有生成的图片...`)
        const existingFile = await checkExistingImage(originalFiles)
        if (existingFile) {
          const fileSize = getFileSize(existingFile)
          console.log(`  ✅ 检测到已生成的图片: ${path.basename(existingFile)} (${(fileSize / 1024).toFixed(1)} KB)`)

          const destPath = path.join(outputDir, cfg.outputName)
          if (moveFile(existingFile, destPath)) {
            console.log(`  ✅ 已移动到: ${cfg.outputName}`)
            success = true
            successCount++
            onProgress?.({ type: 'success', item: cfg, index: i, total: toGenerate.length })
          } else {
            console.log(`  ⚠️ 移动文件失败`)
          }

          console.log(`  [5/5] 删除会话...`)
          await deleteCurrentSession(ops)
          currentSessionCreated = false

          if (i < toGenerate.length - 1) {
            console.log(`  ⏳ 等待${CONFIG.WAIT_AFTER_DELETE / 1000}秒后生成下一张...`)
            await sleep(CONFIG.WAIT_AFTER_DELETE)
          }
          break
        }

        if (!result.ok) {
          console.error(`  ❌ 生成失败: ${result.error}`)

          const detectedFile = await detectAndDownloadImage(originalFiles, ops, finalPrompt)

          if (detectedFile) {
            const fileSize = getFileSize(detectedFile)
            console.log(`  ✅ 文件已保存: ${path.basename(detectedFile)} (${(fileSize / 1024).toFixed(1)} KB)`)

            const destPath = path.join(outputDir, cfg.outputName)
            if (moveFile(detectedFile, destPath)) {
              console.log(`  ✅ 已移动到: ${cfg.outputName}`)
              success = true
              successCount++
              onProgress?.({ type: 'success', item: cfg, index: i, total: toGenerate.length })
            } else {
              console.log(`  ⚠️ 移动文件失败`)
            }

            console.log(`  [5/5] 删除会话...`)
            await deleteCurrentSession(ops)
            currentSessionCreated = false

            if (i < toGenerate.length - 1) {
              console.log(`  ⏳ 等待${CONFIG.WAIT_AFTER_DELETE / 1000}秒后生成下一张...`)
              await sleep(CONFIG.WAIT_AFTER_DELETE)
            }
            break
          } else {
            console.log(`  ⏰ 检测超时，返回生成步骤继续检测...`)
            if (attempt < 3) {
              console.log(`  🔄 准备重试 (${attempt + 1}/3)...`)
            }
            continue
          }
        }

        console.log('  ✅ 生成成功')

        console.log('  [5/5] 等待文件保存...')
        const savedFile = await waitForNewFile(originalFiles, '.png', (elapsed, round) => {
          if (elapsed % 30 === 0 && round) console.log(`    已等待 ${elapsed} 秒 (第${round}轮)...`)
        }, ops, finalPrompt)

        if (savedFile) {
          const fileSize = getFileSize(savedFile)
          console.log(`  ✅ 文件已保存: ${path.basename(savedFile)} (${(fileSize / 1024).toFixed(1)} KB)`)

          const destPath = path.join(outputDir, cfg.outputName)
          if (moveFile(savedFile, destPath)) {
            console.log(`  ✅ 已移动到: ${cfg.outputName}`)
            success = true
            successCount++
            onProgress?.({ type: 'success', item: cfg, index: i, total: toGenerate.length })
          } else {
            console.log(`  ⚠️ 移动文件失败`)
          }

          console.log(`  [6/5] 删除会话...`)
          await deleteCurrentSession(ops)
          currentSessionCreated = false

          if (i < toGenerate.length - 1) {
            console.log(`  ⏳ 等待${CONFIG.WAIT_AFTER_DELETE / 1000}秒后生成下一张...`)
            await sleep(CONFIG.WAIT_AFTER_DELETE)
          }
        } else {
          console.log(`  ⏰ 等待超时 (尝试 ${attempt}/3)`)
          if (attempt < 3) {
            console.log(`  🔄 准备重试 (${attempt + 1}/3)...`)
          }
        }
      } catch (e) {
        console.log(`  ❌ 发生错误: ${e.message}`)
        onError?.({ type: 'error', item: cfg, error: e, attempt })
      }
    }

    if (currentSessionCreated) {
      console.log('  🗑️ 清理会话...')
      await deleteCurrentSession(ops)
    }

    if (!success) {
      console.log('  ❌ 重试次数用完，跳过此图片')
      onError?.({ type: 'skip', item: cfg })
    }
  }

  console.log('\n🔄 正在优雅关闭浏览器（保留登录状态）...')
  if (autoShutdown && module) {
    await gracefulShutdown(module)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 完成!')
  console.log(`${'='.repeat(60)}`)

  const finalFiles = getExistingFiles(outputDir)
  console.log(`📂 目标目录共 ${finalFiles.length} 张图片`)
  console.log(`✅ 成功生成 ${successCount} 张`)
  if (skipped.length > 0) console.log(`⏭️ 跳过 ${skipped.length} 张（已存在）`)

  return {
    success: successCount,
    skipped: skipped.length,
    failed: toGenerate.length - successCount,
    total: items.length
  }
}

// --- 单个图片生成 ---
async function generateSingle(prompt, outputPath, options = {}) {
  const { autoShutdown = true } = options
  return await batchGenerate(
    [{ prompt, outputName: path.basename(outputPath) }],
    path.dirname(outputPath),
    { skipExisting: false, autoShutdown }
  )
}

// --- 导出 ---
module.exports = {
  batchGenerate,
  generateSingle,
  CONFIG,
  ensureBrowser,
  checkGeminiLogin,
  gracefulShutdown,
  deleteCurrentSession,
  sleep
}
