/**
 * 用另一张图的右下角背景填充水印区域
 * 原理：同批生成的图，背景颜色/纹理相似
 */
import sharp from 'sharp';
import { removeWatermarkFromFile } from './watermark-remover.js';

async function fillWithSimilarImage(targetPath, sourcePath, outputPath) {
  console.log(`[fill] 目标: ${targetPath}`);
  console.log(`[fill] 来源: ${sourcePath}`);

  // 读取两张图
  const targetImg = sharp(targetPath);
  const sourceImg = sharp(sourcePath);
  const targetMeta = await targetImg.metadata();
  const sourceMeta = await sourceImg.metadata();

  console.log(`[fill] 目标尺寸: ${targetMeta.width}x${targetMeta.height}`);
  console.log(`[fill] 来源尺寸: ${sourceMeta.width}x${sourceMeta.height}`);

  // 计算水印区域 (96x96, 右下角64px边距)
  const wmSize = 96;
  const margin = 64;
  const targetWmX = targetMeta.width - margin - wmSize;
  const targetWmY = targetMeta.height - margin - wmSize;

  // 从来源图右下角提取一块干净背景
  const srcBgSize = 120; // 稍微大一点，提取无水印区域
  const srcX = sourceMeta.width - srcBgSize;
  const srcY = sourceMeta.height - srcBgSize;

  // 提取并缩放到水印大小
  const fillRegion = await sourceImg
    .extract({ left: srcX, top: srcY, width: srcBgSize, height: srcBgSize })
    .resize(wmSize, wmSize)
    .toBuffer();

  console.log(`[fill] 提取来源图区域 (${srcX},${srcY}) 大小${srcBgSize}x${srcBgSize}`);
  console.log(`[fill] 缩放到 ${wmSize}x${wmSize}`);

  // 读取目标图完整像素
  const { data: pixels, info } = await sharp(targetPath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  // 读取填充区域像素
  const fillPixels = await sharp(fillRegion)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  // 覆盖水印区域
  for (let row = 0; row < wmSize; row++) {
    for (let col = 0; col < wmSize; col++) {
      const targetIdx = ((targetWmY + row) * info.width + (targetWmX + col)) * 4;
      const fillIdx = (row * wmSize + col) * 4;
      pixels[targetIdx] = fillPixels.data[fillIdx];
      pixels[targetIdx + 1] = fillPixels.data[fillIdx + 1];
      pixels[targetIdx + 2] = fillPixels.data[fillIdx + 2];
    }
  }

  // 保存
  await sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).png().toFile(outputPath);

  console.log(`[fill] ✅ 保存到: ${outputPath}`);
}

async function main() {
  const target = process.argv[2] || 'C:\\Users\\DELL\\Downloads\\3.png';
  const source = process.argv[3] || 'C:\\Users\\DELL\\Downloads\\4.png';
  const output = process.argv[4] || target.replace('.png', '_filled.png');

  // 先用Gemini水印脚本处理（效果更好）
  await removeWatermarkFromFile(target);

  // 再用相似区域填充
  await fillWithSimilarImage(target, source, output);

  console.log('\n🎉 完成！');
}

main().catch(e => console.error('❌ 错误:', e.message));
