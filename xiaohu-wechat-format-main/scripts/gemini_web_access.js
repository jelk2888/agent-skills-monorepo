/**
 * Gemini 批量图片生成脚本 (Web-Access 直接调用版)
 *
 * 使用 Chrome 远程调试端口直接操作 Gemini 网页
 *
 * 流程：
 * 1. 使用随机端口和独立用户数据目录启动新的 Chrome 实例
 * 2. 打开 Gemini 网页
 * 3. 依次生成图片：新建会话 → 生成 → 等待下载 → 移动文件 → 删除会话
 * 4. 完成后关闭 Chrome 实例
 *
 * 使用方法:
 *   node gemini_web_access.js configs.json "输出目录"
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const net = require('net');
const crypto = require('crypto');
const WebSocket = require('ws');
const sharp = require('sharp');

// 引入 gemini-skill 的去水印模块
let removeWatermarkFromFile;
try {
  const wmPath = path.join('C:\\Users\\DELL\\.codebuddy\\skills\\gemini-skill\\src', 'watermark-remover.js');
  if (fs.existsSync(wmPath)) {
    const wmModule = require(wmPath);
    removeWatermarkFromFile = wmModule.removeWatermarkFromFile;
  }
} catch (e) {}

// Chrome 路径
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const GEMINI_URL = 'https://gemini.google.com';
const DOWNLOAD_DIR = 'C:\\Users\\DELL\\Downloads';

// 固定调试端口
const CHROME_PORT = 9222;
let chromeProcess = null;

// 持久化用户数据目录（与 gemini_batch_gen.cjs 保持一致，确保登录状态共享）
const PERSISTENT_USER_DATA_DIR = 'D:\\公众号\\gemini-web-data';

// ============ 等待配置 ============
const WAIT_AFTER_DELETE = 5000;       // 删除旧会话后等待时间（毫秒），确保文件完全释放
const FIRST_CHECK_TIMEOUT = 60000;    // 第一次检查图片是否生成的超时时间（毫秒），默认60秒
const RETRY_CHECK_TIMEOUT = 30000;    // 重试检查时的超时时间（毫秒），默认30秒
const RETRY_COUNT = 10;               // 最大重试次数，总等待时间 ≈ RETRY_COUNT × RETRY_CHECK_TIMEOUT
const POLL_INTERVAL = 5000;           // 轮询检查图片是否生成的间隔（毫秒），每4秒检查一次
const MIN_FILE_SIZE = 50000;          // 图片最小文件大小（字节），太小可能是占位图或错误，默认50KB

// ============ 工具函数 ============
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fileExists(filepath) {
  try { fs.accessSync(filepath); return true; } catch { return false; }
}

function getExistingFiles(dir, ext = '.png') {
  try { return fs.readdirSync(dir).filter(f => f.endsWith(ext)); } catch { return []; }
}

function getFileSize(filepath) {
  return fs.statSync(filepath).size;
}

function moveFile(src, dest) {
  if (fileExists(src)) {
    fs.copyFileSync(src, dest);
    fs.unlinkSync(src);
    return true;
  }
  return false;
}

function generateUserDataDir() {
  return PERSISTENT_USER_DATA_DIR;
}

// ============ Chrome 进程管理 ============
async function startChrome(headless = true) {
  console.log('[Chrome] 启动新的 Chrome 实例...');
  if (headless) {
    console.log('[Chrome] 模式: Headless (无窗口)');
  } else {
    console.log('[Chrome] 模式: 非Headless (弹出浏览器)');
  }

  const port = CHROME_PORT;
  const userDataDir = generateUserDataDir();

  try {
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const chromeArgs = headless
      ? [
          '--headless=new',
          '--no-sandbox',
          '--disable-gpu',
          '--disable-software-rasterizer',
        ]
      : [];

    chromeProcess = spawn(CHROME_PATH, [
      ...chromeArgs,
      `--remote-debugging-port=${CHROME_PORT}`,
      `--user-data-dir=${userDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      GEMINI_URL
    ], {
      stdio: 'pipe',
      detached: false
    });

    chromeProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log('[Chrome stdout]', msg);
    });

    chromeProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('DevTools') && !msg.includes('TensorFlow')) {
        console.log('[Chrome stderr]', msg);
      }
    });

    chromeProcess.on('close', (code) => {
      console.log(`[Chrome] 进程已关闭，退出码: ${code}`);
    });

    chromeProcess.on('error', (err) => {
      console.error('[Chrome] 进程错误:', err.message);
    });

    await sleep(5000);

    const isReady = await checkChromePort();
    if (!isReady) {
      console.error('[Chrome] Chrome 端口未就绪');
      chromeProcess.kill();
      return null;
    }

    console.log(`[Chrome] Chrome 已启动，调试端口: ${CHROME_PORT}`);
    return { port: CHROME_PORT, userDataDir };
  } catch (e) {
    console.error('[Chrome] 启动失败:', e.message);
    if (chromeProcess) chromeProcess.kill();
    return null;
  }
}

async function checkChromePort() {
  return new Promise((resolve) => {
    const client = net.createConnection({ port: CHROME_PORT, host: '127.0.0.1' }, () => {
      client.end();
      resolve(true);
    });
    client.on('error', () => resolve(false));
    client.on('timeout', () => resolve(false));
    setTimeout(() => resolve(false), 3000);
  });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// ============ Chrome 远程调试操作 ============
class ChromeRemoteDebug {
  constructor(port) {
    this.port = port;
    this.targets = [];
  }

  async getTargets() {
    try {
      const response = await httpGet(`http://127.0.0.1:${this.port}/json`);
      this.targets = JSON.parse(response);
      return this.targets;
    } catch (e) {
      console.error('[Chrome] 获取目标失败:', e.message);
      return [];
    }
  }

  async closeTab(targetId) {
    try {
      console.log(`[Chrome] 关闭标签: ${targetId}`);
      await httpGet(`http://127.0.0.1:${this.port}/json/close/${targetId}`);
      console.log('[Chrome] 标签已关闭');
      return true;
    } catch (e) {
      console.error('[Chrome] 关闭标签失败:', e.message);
      return false;
    }
  }
}

// ============ CDP 操作 (使用 WebSocket) ============
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 0;
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      const timeout = setTimeout(() => {
        this.ws.close();
        reject(new Error('WebSocket 连接超时'));
      }, 10000);

      this.ws.on('open', () => {
        clearTimeout(timeout);
        console.log('[CDP] WebSocket 已连接');
        resolve();
      });

      this.ws.on('error', (err) => {
        clearTimeout(timeout);
        console.error('[CDP] WebSocket 错误:', err.message);
        reject(err);
      });

      this.ws.on('close', () => {
        console.log('[CDP] WebSocket 连接已关闭');
      });
    });
  }

  sendCommand(method, params) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket 未连接'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`CDP 命令超时: ${method}`));
      }, 30000);

      const handler = (data) => {
        try {
          const resp = JSON.parse(data);
          if (resp.id === this.msgId) {
            clearTimeout(timeout);
            this.ws.removeListener('message', handler);
            resolve(resp);
          }
        } catch (e) {
          console.error('[CDP] 解析响应失败:', e.message);
        }
      };

      this.ws.on('message', handler);
      this.ws.send(JSON.stringify({ id: ++this.msgId, method, params }));
    });
  }

  async evaluate(expression) {
    try {
      console.log(`[CDP] 发送 evaluate: ${expression.substring(0, 100)}...`);
      const result = await this.sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true
      });
      console.log(`[CDP] evaluate 结果:`, JSON.stringify(result));
      return result;
    } catch (e) {
      console.error('[CDP] evaluate 失败:', e.message);
      return { error: e.message };
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// ============ 优雅关闭浏览器 ============
async function gracefulShutdown(chromeProcess, cdp) {
  console.log('[shutdown] 正在优雅关闭浏览器...');
  
  try {
    if (cdp) {
      try {
        await cdp.sendCommand('Page.close');
      } catch (e) {}
    }
    
    if (chromeProcess && !chromeProcess.killed) {
      chromeProcess.kill('SIGTERM');
      
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (!chromeProcess.killed) {
            chromeProcess.kill('SIGKILL');
          }
          resolve();
        }, 10000);
        
        chromeProcess.on('close', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    
    console.log('[shutdown] ✅ 浏览器已关闭，Cookie 和登录状态已保存到磁盘');
    return true;
  } catch (e) {
    console.log(`[shutdown] ⚠️ 关闭异常: ${e.message}`);
    return false;
  }
}

// ============ 检测新文件 ============
async function waitForNewFile(originalFiles, extension = '.png', onProgress) {
  let retryRound = 0;

  while (retryRound < RETRY_COUNT) {
    retryRound++;
    const phaseStart = Date.now();
    const timeout = retryRound === 1 ? FIRST_CHECK_TIMEOUT : RETRY_CHECK_TIMEOUT;
    const phaseName = retryRound === 1 ? '第一阶段' : `重试${retryRound - 1}`;

    console.log(`\n    📊 [${phaseName}] 检测超时: ${timeout / 1000}秒`);

    while (Date.now() - phaseStart < timeout) {
      try {
        const currentFiles = fs.readdirSync(DOWNLOAD_DIR)
          .filter(f => f.endsWith(extension))
          .map(f => path.join(DOWNLOAD_DIR, f));

        const newFiles = currentFiles.filter(f => !originalFiles.includes(f));

        for (const file of newFiles) {
          if (await checkFileReady(file)) {
            console.log(`\n    ✅ 检测到新图片: ${path.basename(file)}`);
            return file;
          }
        }

        const elapsed = Math.round((Date.now() - phaseStart) / 1000);
        const totalElapsed = Math.round((Date.now() - (phaseStart - (retryRound - 1) * timeout)) / 1000);
        onProgress?.(totalElapsed, retryRound);

        if (elapsed % 30 === 0 && elapsed > 0) {
          console.log(`    ⏳ 已等待 ${totalElapsed} 秒 (第${retryRound}轮)...`);
        }

      } catch (e) {
        console.log(`    ⚠️ 检测异常: ${e.message}`);
      }
      await sleep(POLL_INTERVAL);
    }

    console.log(`\n    ⏰ [${phaseName}] 超时(${timeout / 1000}秒)，进入下一轮检测...`);

    if (retryRound < RETRY_COUNT) {
      console.log(`    ⏳ 等待10秒后继续检测...`);
      await sleep(10000);
    }
  }

  console.log(`\n    ❌ 已重试${RETRY_COUNT}轮，仍未检测到图片`);
  return null;
}

async function checkFileReady(filePath) {
  if (!fileExists(filePath)) return false;
  try {
    let size = getFileSize(filePath);
    if (size < MIN_FILE_SIZE) return false;

    await sleep(2000);
    let size2 = getFileSize(filePath);
    if (size !== size2) {
      console.log(`    📥 下载中... ${(size/1024).toFixed(1)}KB -> ${(size2/1024).toFixed(1)}KB`);
      size = size2;
      await sleep(2000);
      size2 = getFileSize(filePath);
      if (size !== size2) {
        console.log(`    📥 下载中... ${(size2/1024).toFixed(1)}KB`);
        return false;
      }
    }

    await sleep(2000);
    const size3 = getFileSize(filePath);
    if (size !== size3) {
      console.log(`    📥 下载中... ${(size3/1024).toFixed(1)}KB`);
      return false;
    }

    console.log(`    ✅ 文件下载完成: ${(size3/1024).toFixed(1)}KB`);
    return true;
  } catch {
    return false;
  }
}

// ============ 操作 Gemini 网页 ============
async function createNewChat(cdp) {
  console.log(`  [1/5] 新建会话...`);

  const result = await cdp.evaluate(`
    (() => {
      const selectors = [
        '[data-test-id="new-chat-button"]',
        'button[aria-label*="新建"]',
        'button[aria-label*="new chat"]',
        '[aria-label="新建聊天"]',
        'a[href="/app"]'
      ];

      for (const selector of selectors) {
        const btn = document.querySelector(selector);
        if (btn) {
          btn.click();
          return { success: true, selector: selector, found: true };
        }
      }

      return { success: false, error: '未找到新建对话按钮', found: false };
    })()
  `);

  if (result?.result?.result?.value?.success) {
    console.log(`  ✅ 新建会话成功 (${result.result.result.value.selector})`);
  } else {
    console.log(`  ⚠️ 新建会话: ${result?.result?.result?.value?.error || '未知错误'}`);
  }

  await sleep(3000);
}

async function switchToQuickMode(cdp) {
  console.log(`  [2/5] 切换到快速模式...`);

  const currentMode = await cdp.evaluate(`
    (() => {
      const modeBtn = document.querySelector('button[aria-label="打开模式选择器"]');
      return modeBtn ? (modeBtn.textContent || '').trim() : '';
    })()
  `);

  const currentModeText = currentMode?.result?.result?.value || '';
  console.log(`  🔍 当前模式: ${currentModeText || '未知'}`);

  if (currentModeText.includes('快速') || currentModeText.includes('Quick')) {
    console.log(`  ✅ 已经是快速模式，跳过`);
    return;
  }

  const openResult = await cdp.evaluate(`
    (() => {
      const btn = document.querySelector('button[aria-label="打开模式选择器"]');
      if (btn) {
        btn.click();
        return { success: true };
      }
      return { success: false };
    })()
  `);

  if (openResult?.result?.result?.value?.success) {
    console.log(`  ✅ 已打开模式选择器`);
    await sleep(2000);

    const selectResult = await cdp.evaluate(`
      (() => {
        const quickOption = document.querySelector('[data-test-id="bard-mode-option-快速"]');
        if (quickOption) {
          quickOption.click();
          return { success: true, method: 'data-test-id' };
        }

        const menuItems = document.querySelectorAll('[role="menuitem"]');
        for (const item of menuItems) {
          const text = (item.textContent || '').trim();
          if (text.includes('快速') || text.includes('Quick') || text.includes('Flash')) {
            item.click();
            return { success: true, method: 'menuitem' };
          }
        }

        return { success: false };
      })()
    `);

    if (selectResult?.result?.result?.value?.success) {
      console.log(`  ✅ 已切换到快速模式`);
    } else {
      console.log(`  ⚠️ 未找到快速模式选项，跳过`);
    }
  } else {
    console.log(`  ⚠️ 未找到模式选择器，跳过`);
  }

  await sleep(2000);
}

async function sendPrompt(cdp, prompt) {
  console.log(`  [3/5] 发送提示词生成图片...`);

  const pageInfo = await cdp.evaluate(`
    (() => {
      return {
        title: document.title,
        url: location.href,
        inputCount: document.querySelectorAll('textarea, [contenteditable="true"]').length,
        buttonCount: document.querySelectorAll('button').length
      };
    })()
  `);

  console.log(`  📄 页面状态:`, JSON.stringify(pageInfo?.result?.result?.value || pageInfo));

  const inputResult = await cdp.evaluate(`
    (() => {
      const selectors = [
        'div.ql-editor[contenteditable="true"][role="textbox"]',
        '[contenteditable="true"][aria-label*="Gemini"]',
        '[contenteditable="true"][data-placeholder*="Gemini"]',
        'div[contenteditable="true"][role="textbox"]'
      ];

      for (const selector of selectors) {
        const inputs = document.querySelectorAll(selector);
        for (const input of inputs) {
          if (!input.disabled) {
            return { found: true, tagName: input.tagName };
          }
        }
      }
      return { found: false };
    })()
  `);

  if (!inputResult?.result?.result?.value?.found) {
    console.log(`  ⚠️ 查找输入框失败`);
    return;
  }

  console.log(`  ✅ 找到输入框`);

  const inputSuccess = await cdp.evaluate(`
    (() => {
      const selectors = [
        'div.ql-editor[contenteditable="true"][role="textbox"]',
        '[contenteditable="true"][aria-label*="Gemini"]',
        '[contenteditable="true"][data-placeholder*="Gemini"]',
        'div[contenteditable="true"][role="textbox"]'
      ];

      let el = null;
      for (const s of selectors) {
        const inputs = document.querySelectorAll(s);
        for (const input of inputs) {
          if (!input.disabled) {
            el = input;
            break;
          }
        }
        if (el) break;
      }

      if (!el) return { success: false };

      el.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      
      const text = ${JSON.stringify(prompt)};
      document.execCommand('insertText', false, text);
      
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return { success: true, method: 'insertText' };
    })()
  `);

  if (inputSuccess?.result?.result?.value?.success) {
    console.log(`  ✅ 已输入提示词 (${inputSuccess.result.result.value.method})`);
  } else {
    console.log(`  ⚠️ 输入提示词失败`);
    return;
  }

  await sleep(1000);

  const sendResult = await cdp.evaluate(`
    (() => {
      const sels = [
        '.send-button-container button.send-button',
        '.send-button-container button'
      ];
      
      for (const s of sels) {
        const btns = document.querySelectorAll(s);
        for (const btn of btns) {
          if (!btn.disabled) {
            btn.click();
            return { success: true, method: 'send-button' };
          }
        }
      }

      const labels = ['发送', 'send'];
      for (const label of labels) {
        const btn = document.querySelector(\`button[aria-label*="\${label}" i]\`);
        if (btn && !btn.disabled) {
          btn.click();
          return { success: true, method: 'aria-label' };
        }
      }

      const event = new KeyboardEvent('keydown', {
        key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
      });
      document.activeElement?.dispatchEvent(event);
      return { success: true, method: 'Enter' };
    })()
  `);

  if (sendResult?.result?.result?.value?.success) {
    console.log(`  ✅ 已发送 (${sendResult.result.result.value.method})`);
  } else {
    console.log(`  ⚠️ 发送失败`);
  }

  console.log(`  ⏳ 等待图片生成...`);
  await sleep(15000);
}

async function downloadImage(cdp, outputDir) {
  console.log(`  [4/5] 循环检测并下载生成的图片...`);

  let imgInfo = null;
  let detectRetry = 0;
  const maxDetectRetries = 30;
  const detectInterval = 4000;

  while (detectRetry < maxDetectRetries) {
    detectRetry++;
    
    imgInfo = await cdp.evaluate(`
      (() => {
        const newImgs = [...document.querySelectorAll('img.image.animate.loaded')];
        const allImgs = [...document.querySelectorAll('img.image.loaded')];

        if (!allImgs.length) return { ok: false, error: 'no_loaded_images', total: 0 };

        const img = newImgs.length > 0
          ? newImgs[newImgs.length - 1]
          : allImgs[allImgs.length - 1];
        
        const index = allImgs.indexOf(img);
        
        img.scrollIntoView({ behavior: 'instant', block: 'center' });
        const rect = img.getBoundingClientRect();
        
        return {
          ok: true,
          width: img.naturalWidth || 0,
          height: img.naturalHeight || 0,
          index: index >= 0 ? index : (allImgs.length - 1),
          total: allImgs.length,
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2)
        };
      })()
    `);

    if (imgInfo?.result?.result?.value?.ok) {
      console.log(`     ✅ 第${detectRetry}次检测 - 找到图片!`);
      break;
    }

    if (detectRetry % 3 === 0) {
      console.log(`     ⏳ 已等待 ${detectRetry * detectInterval / 1000} 秒...`);
    }

    await sleep(detectInterval);
  }

  const info = imgInfo?.result?.result?.value || {};
  
  if (!info.ok) {
    console.log(`  ⚠️ ${maxDetectRetries * detectInterval / 1000}秒内未检测到图片 (返回超时状态)`);
    return 'timed_out';
  }

  console.log(`  📷 图片: ${info.width}x${info.height}, 位置(${info.x}, ${info.y})`);

  const downloadDir = path.resolve(outputDir || DOWNLOAD_DIR);
  console.log(`  🔧 设置下载行为到: ${downloadDir}`);

  try {
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
  } catch (e) {
    console.log(`  ⚠️ 创建下载目录失败: ${e.message}`);
  }

  try {
    await cdp.sendCommand('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir,
      eventsEnabled: true
    });
    console.log(`  ✅ 下载行为已设置 (允许自动下载到 ${downloadDir})`);
  } catch (e) {
    console.log(`  ⚠️ 设置下载行为失败: ${e.message}`);
  }

  const originalFiles = fs.readdirSync(downloadDir)
    .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'))
    .map(f => path.join(downloadDir, f));

  await sleep(500);
  
  await cdp.sendCommand('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: info.x,
    y: info.y,
    button: 'none',
    clickCount: 0
  });
  console.log(`  ✅ Hover 完成, 等待工具栏...`);
  await sleep(1500);

  let downloadClicked = false;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    const clickResult = await cdp.evaluate(`
      (() => {
        const btn = document.querySelector('button[data-test-id="download-generated-image-button"]');
        
        if (btn && !btn.disabled) {
          btn.click();
          return { success: true, attempt: ${attempt} };
        }
        
        return { success: false, attempt: ${attempt} };
      })()
    `);

    if (clickResult?.result?.result?.value?.success) {
      downloadClicked = true;
      console.log(`  ✅ 已点击下载按钮 (第${clickResult.result.result.value.attempt}次)`);
      break;
    }

    if (attempt < 3) {
      await cdp.sendCommand('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: info.x,
        y: info.y,
        button: 'none',
        clickCount: 0
      });
      await sleep(800);
    }
  }

  if (!downloadClicked) {
    console.log(`  ❌ 未找到下载按钮`);
    return null;
  }

  console.log(`  ⏳ 等待文件下载完成 (最长60秒)...`);

  let downloadedFile = null;
  let waited = 0;
  const maxWait = 60000;
  const checkInterval = 2000;

  while (waited < maxWait) {
    await sleep(checkInterval);
    waited += checkInterval;

    const currentFiles = fs.readdirSync(downloadDir)
      .filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'))
      .map(f => path.join(downloadDir, f));

    const newFiles = currentFiles.filter(f => !originalFiles.includes(f));

    for (const file of newFiles) {
      try {
        const stat = fs.statSync(file);
        if (stat.size > 10000) {
          await sleep(2000);
          try {
            const stat2 = fs.statSync(file);
            if (stat2.size >= stat.size) {
              downloadedFile = file;
              break;
            }
          } catch (e) {}
          
          console.log(`     📥 检测到新文件: ${path.basename(file)} (${(stat.size/1024).toFixed(1)}KB)`);
        }
      } catch (e) {}
    }

    if (downloadedFile) break;

    if (waited % 10000 === 0 && waited > 0) {
      console.log(`     ⏳ 已等待 ${waited/1000} 秒...`);
    }
  }

  if (!downloadedFile) {
    console.log(`  ❌ 60秒内未检测到文件下载完成`);
    return null;
  }

  const fileSize = getFileSize(downloadedFile);
  console.log(`  ✅ 文件已下载! ${path.basename(downloadedFile)} (${(fileSize / 1024).toFixed(1)} KB)`);

  if (removeWatermarkFromFile) {
    console.log(`  ✨ 去水印处理...`);
    try {
      const wmResult = await removeWatermarkFromFile(downloadedFile);
      if (wmResult.ok) {
        console.log(`  ✅ 水印已移除 (${wmResult.width || '?'}x${wmResult.height || '?'})`);
      } else if (wmResult.skipped) {
        console.log(`  ⏭️ 跳过去水印: ${wmResult.reason || ''}`);
      } else {
        console.log(`  ⚠️ 去水印失败: ${wmResult.error || ''}`);
      }
    } catch (e) {
      console.log(`  ⚠️ 去水印异常: ${e.message}`);
    }
  }

  return downloadedFile;
}

async function checkBlankSession(cdp) {
  const result = await cdp.evaluate(`
    (() => {
      const userQueries = document.querySelectorAll('[class*="user-query"], [data-test-id*="user"], [class*="UserQuery"]');
      const images = document.querySelectorAll('img.image.loaded, img.image.animate.loaded');
      const messageBubbles = document.querySelectorAll('[class*="message-bubble"], [class*="message-content"], [class*="markdown"]');
      
      return {
        hasUserQuery: userQueries.length > 0,
        hasImages: images.length > 0,
        imageCount: images.length,
        hasMessages: messageBubbles.length > 0,
        isBlank: userQueries.length === 0 && images.length === 0 && messageBubbles.length === 0,
        bodyTextLength: document.body ? document.body.textContent.trim().length : 0
      };
    })()
  `);

  return result?.result?.result?.value || { isBlank: true };
}

async function deleteCurrentSession(cdp) {
  console.log(`  [5/5] 删除会话...`);

  const result = await cdp.evaluate(`
    (() => {
      const allButtons = Array.from(document.querySelectorAll('button'))
        .filter(btn => {
          const label = btn.getAttribute('aria-label') || '';
          return label.includes('更多选项') && 
                 !label.includes('Gem') && 
                 !label.includes('notebook') &&
                 !label.includes('笔记本');
        });

      if (allButtons.length > 0) {
        allButtons[0].click();
        return { success: true, totalFound: allButtons.length };
      }

      return { success: false };
    })()
  `);

  if (!result?.result?.result?.value?.success) {
    console.log(`  ⚠️ 未找到菜单按钮，跳过删除`);
    return false;
  }

  console.log(`  ✅ 已打开更多选项菜单 (共${result.result.result.value.totalFound}个)`);
  await sleep(1500);

  const deleteResult = await cdp.evaluate(`
    (() => {
      const deleteBtn = document.querySelector('[data-test-id*="delete"]');
      if (deleteBtn) {
        deleteBtn.click();
        return { success: true, method: 'data-test-id' };
      }

      const menuItems = document.querySelectorAll('[role="menuitem"]');
      for (const item of menuItems) {
        const text = (item.textContent || '').trim().toLowerCase();
        if (text.includes('删除') || text.includes('delete')) {
          item.click();
          return { success: true, method: 'menuitem' };
        }
      }
      return { success: false };
    })()
  `);

  if (!deleteResult?.result?.result?.value?.success) {
    console.log(`  ⚠️ 未找到删除选项`);
    return false;
  }

  console.log(`  ✅ 已点击删除`);
  await sleep(1500);

  let confirmClicked = false;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    const confirmResult = await cdp.evaluate(`
      (() => {
        const dialogs = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, [class*="dialog"], [class*="Dialog"], [class*="confirm"], [class*="Confirm"]');
        
        for (const dialog of dialogs) {
          const buttons = dialog.querySelectorAll('button');
          for (const btn of buttons) {
            const text = (btn.textContent || '').trim();
            if (text === '删除' || text === 'Delete' || text === '确定' || text === 'Confirm') {
              btn.click();
              return { success: true, method: 'dialog-button', text: text };
            }
          }
        }

        const allBtns = Array.from(document.querySelectorAll('button'));
        for (const btn of allBtns) {
          const text = (btn.textContent || '').trim();
          if (text === '删除' || text === 'Delete') {
            btn.click();
            return { success: true, method: 'exact-match', text: text };
          }
        }

        for (const btn of allBtns) {
          const text = (btn.textContent || '').trim().toLowerCase();
          const label = (btn.getAttribute('aria-label') || '').toLowerCase();
          if ((text.includes('删除') || text.includes('delete') || label.includes('删除') || label.includes('delete')) &&
              !text.includes('取消') && !label.includes('取消') && 
              !text.includes('cancel') && !label.includes('cancel')) {
            btn.click();
            return { success: true, method: 'loose-match', text: btn.textContent?.trim() };
          }
        }

        return { success: false };
      })()
    `);

    if (confirmResult?.result?.result?.value?.success) {
      confirmClicked = true;
      console.log(`  ✅ 已点击确认 (${confirmResult.result.result.value.method}: "${confirmResult.result.result.value.text}")`);
      break;
    }

    console.log(`     ⚠️ 第${attempt}次未找到确认按钮，等待后重试...`);
    await sleep(1000);
  }

  if (!confirmClicked) {
    console.log(`  ⚠️ 未找到确认删除按钮，尝试按Enter键确认...`);
    await cdp.sendCommand('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13
    });
    await sleep(100);
    await cdp.sendCommand('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'Enter',
      code: 'Enter',
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13
    });
  }

  await sleep(2000);
  console.log(`  🗑️ 会话已删除`);
  return true;
}

// ============ 批量生成主函数 ============
async function batchGenerate(configPath, outputDir, options = {}) {
  const useHeadless = options.headless !== false;
  const configs = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  console.log(`\n📋 将生成 ${configs.length} 个项目`);
  configs.forEach((cfg, i) => {
    const prompt = cfg.prompt.length > 60 ? cfg.prompt.substring(0, 60) + '...' : cfg.prompt;
    console.log(`  ${i + 1}. [image] ${prompt}`);
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 批量生成 ${configs.length} 个项目`);
  console.log(`📁 输出目录: ${outputDir}`);
  console.log(`${'='.repeat(60)}\n`);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const existingFiles = getExistingFiles(outputDir);
  console.log(`📂 目标目录已有 ${existingFiles.length} 张图片`);

  const toGenerate = [];
  const skipped = [];

  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i];
    const destPath = path.join(outputDir, cfg.outputName);
    if (fileExists(destPath)) {
      skipped.push({ ...cfg, originalIndex: i + 1 });
    } else {
      toGenerate.push({ ...cfg, originalIndex: i + 1 });
    }
  }

  console.log(`📋 需生成 ${toGenerate.length} 张图片\n`);

  if (skipped.length > 0) {
    skipped.forEach(s => {
      console.log(`  ⏭️ 跳过 [${s.originalIndex}] ${s.outputName} (已存在)`);
    });
    console.log('');
  }

  if (toGenerate.length === 0) {
    console.log('✅ 所有图片已存在，无需生成!');
    return;
  }

  const chromeInfo = await startChrome(useHeadless);
  if (!chromeInfo) {
    console.error('[Error] 无法启动 Chrome');
    return;
  }

  const { port, userDataDir } = chromeInfo;
  const chromeDebug = new ChromeRemoteDebug(port);

  console.log('[Chrome] 获取标签页信息...');
  await sleep(3000);
  await chromeDebug.getTargets();

  console.log(`[Chrome] 找到 ${chromeDebug.targets.length} 个目标`);
  for (const t of chromeDebug.targets) {
    console.log(`  - ${t.id}: ${t.url} (${t.type})`);
  }

  const geminiTarget = chromeDebug.targets.find(t =>
    t.url && t.url.includes('gemini.google.com') && t.type === 'page'
  );

  if (!geminiTarget || !geminiTarget.id) {
    console.error('[Error] 未找到 Gemini 标签页');
    chromeProcess.kill();
    return;
  }

  const targetId = geminiTarget.id;
  const wsUrl = geminiTarget.webSocketDebuggerUrl;
  console.log(`[Chrome] 使用标签页: ${targetId} (${geminiTarget.url})`);

  const cdp = new CDPClient(wsUrl);

  console.log('[Chrome] 连接 CDP...');
  try {
    await cdp.connect();
    console.log('[Chrome] CDP 已连接');
  } catch (e) {
    console.error('[Error] CDP 连接失败:', e.message);
    chromeProcess.kill();
    return;
  }

  console.log('⏳ 等待页面加载...');
  await sleep(5000);

  let pageTitle = '';
  let pageUrl = '';
  let pageReady = false;
  let retryCount = 0;
  
  while (!pageReady && retryCount < 15) {
    const pageInfo = await cdp.evaluate(`
      (() => {
        return {
          title: document.title,
          url: location.href,
          readyState: document.readyState,
          bodyLoaded: document.body ? true : false,
          bodyTextLength: document.body ? document.body.textContent.length : 0
        };
      })()
    `);
    
    const info = pageInfo?.result?.result?.value || {};
    pageTitle = info.title || '';
    pageUrl = info.url || '';
    const readyState = info.readyState || '';
    const bodyLoaded = info.bodyLoaded || false;
    
    console.log(`[Chrome] 页面状态:`);
    console.log(`  - 标题: ${pageTitle || '未知'}`);
    console.log(`  - URL: ${pageUrl || '未知'}`);
    console.log(`  - 就绪状态: ${readyState}`);
    console.log(`  - 正文已加载: ${bodyLoaded}`);
    
    if (pageUrl.includes('signin') || pageUrl.includes('login')) {
      console.log('🔍 检测到登录页面，请手动登录...');
      console.log('请在打开的浏览器中登录 Google 账号，然后按 Enter 键继续...');
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise(resolve => {
        rl.question('登录完成后按 Enter 键继续: ', () => {
          rl.close();
          resolve();
        });
      });
      
      console.log('✅ 继续执行...');
      continue;
    }
    
    if (readyState === 'complete' && bodyLoaded && (pageTitle || pageUrl.includes('gemini.google.com'))) {
      pageReady = true;
      console.log('✅ 页面已成功加载');
    } else {
      console.log('⏳ 页面尚未加载，等待中...');
      await sleep(3000);
      retryCount++;
    }
  }

  if (!pageReady) {
    console.error('[Error] 页面加载失败');
    cdp.close();
    chromeProcess.kill();
    return;
  }

  console.log('[Chrome] 页面已成功加载');

  if (useHeadless) {
    console.log('[Chrome] 激活页面 (Headless模式)...');
    try {
    await cdp.sendCommand('Page.bringToFront');
    await cdp.sendCommand('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: 400, y: 300, button: 'left', clickCount: 1
    });
    await cdp.sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: 400, y: 300, button: 'left', clickCount: 1
    });
    await sleep(2000);
    console.log('[Chrome] ✅ 页面已激活');
    } catch (e) {
      console.log(`[Chrome] ⚠️ 激活失败: ${e.message}，继续...`);
    }
  }

  for (let i = 0; i < toGenerate.length; i++) {
    const cfg = toGenerate[i];
    const prompt = cfg.prompt.length > 40 ? cfg.prompt.substring(0, 40) + '...' : cfg.prompt;

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📦 ${cfg.originalIndex}/${configs.length} [image] ${prompt}`);
    console.log(`${'─'.repeat(60)}`);

    let success = false;
    let needNewChat = true;

    for (let attempt = 1; attempt <= 5 && !success; attempt++) {
      try {
        if (needNewChat) {
          console.log(`  [1/3] 新建会话...`);
          await createNewChat(cdp);

          console.log(`  [2/3] 切换快速模式+发送提示词...`);
          await switchToQuickMode(cdp);

          const finalPrompt = '帮我生成图片：' + cfg.prompt + '，分辨率4K';
          await sendPrompt(cdp, finalPrompt);

          needNewChat = false;
        } else {
          console.log(`  [继续检测] 第${attempt}次尝试 (复用现有对话)...`);
        }

        console.log(`  [3/3] 检测并下载图片...`);
        const downloadedPath = await downloadImage(cdp, outputDir);

        if (downloadedPath && downloadedPath !== 'timed_out') {
          console.log(`  ✅ 图片已处理完成: ${path.basename(downloadedPath)}`);

          const destPath = path.join(outputDir, cfg.outputName);
          if (downloadedPath !== destPath && fileExists(downloadedPath)) {
            try {
              if (fileExists(destPath)) fs.unlinkSync(destPath);
              fs.renameSync(downloadedPath, destPath);
              console.log(`  ✅ 已重命名为: ${cfg.outputName}`);
            } catch (e) {
              fs.copyFileSync(downloadedPath, destPath);
              try { fs.unlinkSync(downloadedPath); } catch (e2) {}
              console.log(`  ✅ 已复制为: ${cfg.outputName}`);
            }
          }

          success = true;

          console.log('  [完成] 删除当前会话...');
          await deleteCurrentSession(cdp);

          if (i < toGenerate.length - 1) {
            console.log(`  ⏳ 等待2秒后下一张...`);
            await sleep(2000);
          }

        } else if (downloadedPath === 'timed_out') {
          console.log(`  🔄 120秒超时，刷新网页...`);
          try {
            await cdp.sendCommand('Page.reload', { ignoreCache: true });
            console.log(`  ✅ 网页已刷新，等待8秒...`);
            await sleep(8000);
            
            if (useHeadless) {
              console.log(`  🔄 重新激活页面...`);
              await cdp.sendCommand('Input.dispatchMouseEvent', {
                type: 'mousePressed', x: 400, y: 300, button: 'left', clickCount: 1
              });
              await cdp.sendCommand('Input.dispatchMouseEvent', {
                type: 'mouseReleased', x: 400, y: 300, button: 'left', clickCount: 1
              });
              await sleep(2000);
            }
          } catch (e) {
            console.log(`  ⚠️ 刷新/激活失败: ${e.message}，直接等待5秒...`);
            await sleep(5000);
          }

          console.log(`  🔍 检测对话状态...`);
          const sessionState = await checkBlankSession(cdp);
          console.log(`     状态: isBlank=${sessionState.isBlank}, hasUserQuery=${sessionState.hasUserQuery}, hasImages=${sessionState.imageCount}, bodyLen=${sessionState.bodyTextLength}`);

          if (!sessionState.isBlank) {
            console.log(`  🔄 对话仍存在，继续循环检测图片 (第${attempt + 1}/5次)...`);
            needNewChat = false;
          } else {
            console.log(`  📝 空白对话! 从头开始 (第${attempt + 1}/5次)，不删除会话`);
            needNewChat = true;
          }

        } else {
          console.log(`  ⚠️ 下载返回null (尝试 ${attempt}/5)`);
          needNewChat = true;
        }

      } catch (e) {
        console.log(`  ❌ 发生错误: ${e.message}`);
        needNewChat = true;
      }
    }

    if (!success) {
      console.log('  ❌ 5次重试用完，跳过此图片');
    }
  }

  console.log('\n🔄 正在关闭...');
  await gracefulShutdown(chromeProcess, cdp);

  console.log('[Chrome] 用户数据目录已保留: ' + PERSISTENT_USER_DATA_DIR);

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 完成!');
  console.log(`${'='.repeat(60)}`);

  const finalFiles = getExistingFiles(outputDir);
  console.log(`📁 目标目录共 ${finalFiles.length} 张图片`);

  const successCount = toGenerate.filter(cfg => fileExists(path.join(outputDir, cfg.outputName))).length;
  console.log(`✅ 成功生成 ${successCount} 张`);
  if (skipped.length > 0) console.log(`⏭️ 跳过 ${skipped.length} 张（已存在）`);
}

// ============ 主入口 ============
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║   Gemini 批量图片生成工具 v2.0        ║');
    console.log('╠══════════════════════════════════════╣');
    console.log('║                                      ║');
    console.log('║  用法:                                ║');
    console.log('║  node gemini_web_access.js <configs> <output> [选项]');
    console.log('║                                      ║');
    console.log('║  参数:                                ║');
    console.log('║    configs  配置文件 (JSON)            ║');
    console.log('║    output   输出目录                   ║');
    console.log('║                                      ║');
    console.log('║  选项:                                ║');
    console.log('║    --no-headless  弹出浏览器窗口 (可选)   ║');
    console.log('║                   默认不弹出浏览器         ║');
    console.log('║                                      ║');
    console.log('║  示例:                                ║');
    console.log('║    node gemini_web_access.js test.json "output"');
    console.log('║    node gemini_web_access.js test.json "output" --no-headless');
    console.log('╚══════════════════════════════════════╝');
    console.log('');
    return;
  }

  const configPath = args[0];
  const outputDir = args[1];

  const options = {
    headless: !args.includes('--no-headless')
  };

  console.log(`\n🚀 模式: ${options.headless ? '🔒 Headless (无弹窗)' : '🖥️ 非Headless (弹出浏览器)'}`);
  await batchGenerate(configPath, outputDir, options);
}

main().catch(console.error);