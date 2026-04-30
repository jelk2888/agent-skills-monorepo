import { createGeminiSession, disconnect } from './index.js';

const prompt = 'A magical flying cat soaring through a starry night sky. The cat has fluffy wings made of starlight and cosmic energy. Floating through clouds with the moon in the background. Dreamy, ethereal atmosphere with sparkles and aurora borealis. Fantasy illustration style, enchanting, 9:16 vertical portrait';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('=== Flying Cat Image Generator ===\n');

  const { ops } = await createGeminiSession();

  process.on('SIGINT', () => {
    console.log('\n[demo] Ctrl+C 收到，断开浏览器连接...');
    disconnect();
    process.exit(0);
  });

  try {
    console.log('[1] 探测页面元素...');
    const probe = await ops.probe();
    console.log('probe:', JSON.stringify(probe, null, 2));

    console.log('\n[2] 检查模型...');
    if (probe.currentModel.toLowerCase() === 'pro') {
      console.log('[2] 当前已是 Pro 模型，跳过');
    } else {
      console.log(`[2] 当前模型: ${probe.currentModel || '未知'}，切换到 Pro...`);
      await ops.ensureModelPro();
      console.log('[2] 已切换到 Pro');
    }

    console.log('\n[3] 发送提示词...');
    const result = await ops.sendAndWait(prompt, {
      timeout: 180_000,
      onPoll(poll) {
        console.log(`  polling... status=${poll.status}`);
      },
    });
    console.log('result:', JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log('\n[4] 等待图片加载完成...');
      const imgLoadStart = Date.now();
      while (Date.now() - imgLoadStart < 60_000) {
        const { loaded } = await ops.checkImageLoaded();
        if (loaded) break;
        console.log('  图片加载中...');
        await sleep(500);
      }
      console.log('[4] 图片加载完成');

      console.log('\n[5] 获取完整尺寸图片...');
      const dlResult = await ops.downloadFullSizeImage();
      if (dlResult.ok) {
        console.log(`✅ 图片已保存: ${dlResult.filePath}`);
      } else {
        console.warn(`[5] ⚠ 完整尺寸下载失败: ${dlResult.error}`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  }

  console.log('\n[done]');
}

main().catch(console.error);
