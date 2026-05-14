/**
 * Gemini 批量图片生成模块 - 向后兼容包装器
 * 
 * 此文件作为 gemini_web_access.js 的包装器，保持旧版 API 兼容性
 * 实际功能已迁移到 gemini_web_access.js
 * 
 * 使用方法：
 *   const { batchGenerate } = require('./gemini_batch_gen')
 *   await batchGenerate([
 *     { prompt: '描述1', outputName: 'image1.png' },
 *     { prompt: '描述2', outputName: 'image2.png' }
 *   ], 'output/directory')
 */

const path = require('path');
const { execFileSync } = require('child_process');

/**
 * 批量生成图片（向后兼容 API）
 * @param {Array} items - 图片配置数组，每个元素包含 prompt 和 outputName
 * @param {string} outputDir - 输出目录
 * @param {Object} options - 可选配置
 */
async function batchGenerate(items, outputDir, options = {}) {
  console.log('[gemini_batch_gen] 已迁移到 gemini_web_access.js，正在调用...');
  
  // 生成临时配置文件
  const configPath = path.join(outputDir, '__temp_config.json');
  const fs = require('fs');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 写入配置文件
  fs.writeFileSync(configPath, JSON.stringify(items, null, 2), 'utf-8');
  
  try {
    // 调用 gemini_web_access.js
    const geminiWebAccessPath = path.join(__dirname, 'gemini_web_access.js');
    
    let args = [geminiWebAccessPath, configPath, outputDir];
    if (options.headless === false) {
      args.push('--no-headless');
    }
    
    console.log(`[gemini_batch_gen] 执行: node ${args.join(' ')}`);
    
    // 同步执行
    const result = execFileSync('node', args, {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    console.log('[gemini_batch_gen] ✅ 批量生成完成');
    return { success: true };
  } catch (error) {
    console.error('[gemini_batch_gen] ❌ 批量生成失败:', error.message);
    return { success: false, error: error.message };
  } finally {
    // 清理临时配置文件
    if (fs.existsSync(configPath)) {
      try {
        fs.unlinkSync(configPath);
      } catch (e) {}
    }
  }
}

// 导出 API
module.exports = {
  batchGenerate
};

// 如果直接运行此文件
if (require.main === module) {
  console.log('gemini_batch_gen.js 已迁移到 gemini_web_access.js');
  console.log('请使用: node gemini_web_access.js config.json output_dir');
}