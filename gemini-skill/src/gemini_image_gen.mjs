/**
 * Gemini 图片生成 + 下载 + 继续生图 完整流程 (Node.js 版本)
 * 
 * 使用方法:
 *   node gemini_image_gen.mjs "prompt" [--new-session] [--output-dir "path"]
 *   node gemini_image_gen.mjs --batch config.json
 */

import { createGeminiSession, disconnect } from './index.js';
import { writeFileSync, mkdirSync, existsSync, copyFileSync, statSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 配置
const PICTURES_DIR = join(process.env.USERPROFILE || process.env.HOME || '', 'Pictures', 'gemini');
const MAX_WAIT_FILE_MS = 300000; // 5分钟
const POLL_INTERVAL_MS = 3000;
const MIN_FILE_SIZE = 50000;

// 工具函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getFileAge(filePath) {
  const stats = statSync(filePath);
  return (Date.now() - stats.mtimeMs) / 1000; // 秒
}

function getFileSize(filePath) {
  return statSync(filePath).size;
}

// 等待新文件生成
async function waitForNewFile(originalFiles, maxWaitMs = MAX_WAIT_FILE_MS) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const currentFiles = readdirSync(PICTURES_DIR)
      .filter(f => f.endsWith('.png'))
      .map(f => join(PICTURES_DIR, f));
    
    const newFiles = currentFiles.filter(f => !originalFiles.includes(f));
    
    if (newFiles.length > 0) {
      // 找到新文件，等待下载完成
      for (const file of newFiles) {
        if (await checkFileDownloaded(file)) {
          return file;
        }
      }
    }
    
    console.log(`  等待新图片... (${Math.round((Date.now() - startTime) / 1000)}s)`);
    await sleep(POLL_INTERVAL_MS);
  }
  
  return null;
}

// 检查文件是否下载完成
async function checkFileDownloaded(filePath) {
  if (!existsSync(filePath)) return false;
  
  const size = getFileSize(filePath);
  if (size < MIN_FILE_SIZE) return false;
  
  // 检查文件是否还在写入（修改时间 < 5秒）
  const age = getFileAge(filePath);
  if (age < 5) {
    await sleep(3000);
    return checkFileDownloaded(filePath); // 重新检查
  }
  
  return true;
}

// 验证文件完整性
async function verifyFileComplete(filePath, checkCount = 5) {
  const sizes = [];
  
  for (let i = 0; i < checkCount; i++) {
    if (!existsSync(filePath)) return false;
    sizes.push(getFileSize(filePath));
    if (i < checkCount - 1) await sleep(2000);
  }
  
  // 大小稳定且 > 最小值
  return sizes.every(s => s === sizes[0]) && sizes[0] > MIN_FILE_SIZE;
}

// 生成单张图片
async function generateAndDownload(prompt, options = {}) {
  const { newSession = false, outputDir = null, outputName = null } = options;
  
  console.log(`\n🎨 生成图片: ${prompt.substring(0, 50)}...`);
  
  // 记录当前文件
  const originalFiles = existsSync(PICTURES_DIR) 
    ? readdirSync(PICTURES_DIR).filter(f => f.endsWith('.png')).map(f => join(PICTURES_DIR, f))
    : [];
  
  try {
    // 创建会话
    const { ops } = await createGeminiSession();
    
    // 检查登录
    const loginCheck = await ops.checkLogin();
    if (!loginCheck.ok || !loginCheck.loggedIn) {
      console.error('❌ Gemini 未登录');
      disconnect();
      return { success: false, error: 'Not logged in' };
    }
    
    // 新建会话
    if (newSession) {
      await ops.click('newChatBtn');
      await sleep(500);
    }
    
    // 确保是 Pro 模型
    await ops.ensureModelPro();
    
    // 生成图片
    console.log('  生成中 (可能需要 60-120 秒)...');
    const result = await ops.generateImage(prompt, { timeout: 180000 });
    
    disconnect();
    
    if (!result.ok) {
      console.error(`❌ 生成失败: ${result.error}`);
      return { success: false, error: result.error };
    }
    
    console.log('✅ 图片生成成功');
    
    // 等待下载
    console.log('  等待文件保存...');
    const savedFile = await waitForNewFile(originalFiles);
    
    if (!savedFile) {
      console.error('❌ 等待文件超时');
      return { success: false, error: 'Timeout waiting for file' };
    }
    
    // 验证文件
    console.log('  验证文件完整性...');
    const isValid = await verifyFileComplete(savedFile);
    
    if (!isValid) {
      console.warn('⚠️ 文件可能未下载完整');
    }
    
    const fileSize = getFileSize(savedFile);
    console.log(`✅ 文件已保存: ${basename(savedFile)} (${(fileSize / 1024).toFixed(1)} KB)`);
    
    // 复制到输出目录
    let finalPath = savedFile;
    if (outputDir) {
      mkdirSync(outputDir, { recursive: true });
      const destName = outputName || `${Date.now()}.png`;
      const destPath = join(outputDir, destName);
      copyFileSync(savedFile, destPath);
      finalPath = destPath;
      console.log(`✅ 已复制到: ${destPath}`);
    }
    
    return {
      success: true,
      originalPath: savedFile,
      outputPath: finalPath,
      fileSize
    };
    
  } catch (error) {
    console.error(`❌ 错误: ${error.message}`);
    disconnect();
    return { success: false, error: error.message };
  }
}

// 批量生成图片
async function batchGenerate(configs, outputDir) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`开始批量生成 ${configs.length} 张图片`);
  console.log(`输出目录: ${outputDir}`);
  console.log(`${'='.repeat(60)}`);
  
  mkdirSync(outputDir, { recursive: true });
  
  const results = [];
  
  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`第 ${i + 1}/${configs.length} 张图片`);
    console.log(`${'─'.repeat(60)}`);
    
    const outputName = `image_${String(i + 1).padStart(2, '0')}.png`;
    const result = await generateAndDownload(config.prompt, {
      newSession: config.newSession ?? false,
      outputDir,
      outputName
    });
    
    results.push({
      index: i + 1,
      prompt: config.prompt,
      ...result
    });
    
    // 每张图片间隔 3 秒
    if (i < configs.length - 1) {
      console.log('  等待 3 秒后继续...');
      await sleep(3000);
    }
  }
  
  // 总结
  console.log(`\n${'='.repeat(60)}`);
  console.log('批量生成完成!');
  console.log(`${'='.repeat(60)}`);
  
  const successCount = results.filter(r => r.success).length;
  console.log(`成功: ${successCount}/${configs.length}`);
  
  for (const r of results) {
    const icon = r.success ? '✅' : '❌';
    const name = r.success ? basename(r.outputPath) : r.error;
    console.log(`  ${icon} 图片 ${r.index}: ${name}`);
  }
  
  return results;
}

// 主入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Gemini 图片生成工具

用法:
  单张生成:
    node gemini_image_gen.mjs "prompt text" [--new-session] [--output-dir "path"]
  
  批量生成:
    node gemini_image_gen.mjs --batch config.json

示例:
  node gemini_image_gen.mjs "一只可爱的猫咪"
  node gemini_image_gen.mjs "一只猫咪" --new-session --output-dir "D:\\images"
  node gemini_image_gen.mjs --batch my_configs.json
    `);
    process.exit(0);
  }
  
  // 解析参数
  const options = { outputDir: null };
  let prompt = null;
  let isBatch = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--batch') {
      isBatch = true;
      const configPath = args[++i];
      const { default: configs } = await import(configPath);
      
      const outputDir = join(__dirname, 'output', `batch_${Date.now()}`);
      await batchGenerate(configs, outputDir);
      return;
    }
    
    if (args[i] === '--new-session') {
      options.newSession = true;
    } else if (args[i] === '--output-dir') {
      options.outputDir = args[++i];
    } else if (!args[i].startsWith('--')) {
      prompt = args[i];
    }
  }
  
  if (prompt) {
    const result = await generateAndDownload(prompt, options);
    if (result.success) {
      console.log(`\n🎉 完成！文件: ${result.outputPath}`);
    }
  }
}

// 运行
main().catch(console.error);
