---
name: genini_web_access
description: 通过 Chrome CDP 远程调试协议直接操作 Gemini 网页进行批量图片生成。支持 Headless（无窗口）和非Headless（弹出浏览器）两种模式。当用户需要"批量生成Gemini图片"、"Gemini批量生图"、"用网页版Gemini生成多张图片"、"gemini web access 批量生图"、"通过浏览器操作Gemini生成图片"时触发此技能。也适用于需要自定义 Gemini 图片生成流程、控制下载路径、去水印、会话管理等场景。与 gemini-skill 的区别：本技能使用独立 Chrome 实例 + CDP 直接操控，适合批量任务；gemini-skill 使用 Daemon + MCP 工具，适合单次交互。
---

# Gemini Web Access - 批量图片生成技能

## 概述

本技能封装了 `gemini_web_access.js` 脚本，通过 **Chrome DevTools Protocol (CDP)** 直接操作 Google Gemini 网页进行**批量图片生成**。

### 核心特性

- **双模式运行**: 支持 `--headless`（无窗口/默认）和 `--no-headless`（弹出浏览器）模式
- **完整流程自动化**: 新建会话 → 切换快速模式 → 发送提示词 → 检测图片 → 下载 → 去水印 → 重命名 → 删除会话
- **超时恢复机制**: 120秒超时自动刷新页面 → 检测对话状态 → 智能继续或重试（最多5次）
- **去水印集成**: 自动调用 sharp 库移除 Gemini 图片水印
- **断点续传**: 已存在的图片自动跳过

## 前置条件

1. **Chrome 浏览器**: 安装在默认路径 `C:\Program Files\Google\Chrome\Application\chrome.exe`
2. **Node.js 依赖**: 需要 `ws` 和 `sharp` npm 包
3. **Google 登录状态**: 首次运行需手动登录，之后使用固定用户数据目录保持登录

### 安装依赖

```bash
npm install ws sharp
```

## 使用方法

### 基本用法

```bash
node gemini_web_access.js <配置文件.json> <输出目录> [选项]
```

### 参数说明

| 参数 | 必填 | 说明 |
|------|------|------|
| `configs` | 是 | JSON 配置文件路径 |
| `output` | 是 | 输出目录路径 |

### 选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `--headless` | 默认开启 | 无窗口模式（后台运行） |
| `--no-headless` | -- | 弹出浏览器窗口模式 |

### 示例

```bash
# Headless 模式（默认）- 后台运行不弹窗
node gemini_web_access.js test_configs.json "output"

# 非Headless 模式 - 弹出浏览器窗口
node gemini_web_access.js test_configs.json "output" --no-headless

# 查看帮助
node gemini_web_access.js
```

## 配置文件格式

JSON 数组，每个元素包含 `prompt`（提示词）和 `outputName`（输出文件名）：

```json
[
  {
    "prompt": "中国苏州园林中的古典亭台楼阁，烟雨蒙蒙"
    // 实际发送: "帮我生成图片：中国苏州园林中的古典亭台楼阁，烟雨蒙蒙，分辨率4K",
    "outputName": "suzhou_garden.png"
  },
  {
    "prompt": "中国敦煌莫高窟内景，飞天壁画"
    // 实际发送: "帮我生成图片：中国敦煌莫高窟内景，飞天壁画，分辨率4K",
    "outputName": "dunhuang_mogao.png"
  }
]
```

## 执行流程详解

对每张图片执行以下步骤：

```
[1] 新建会话 (createNewChat)
    |
[2] 切换到"快速"模式 (switchToQuickMode)
    |
[3] 输入提示词并发送 (sendPrompt)
    自动添加前缀 "帮我生成图片：" + 提示词 + "，分辨率4K"
    |
[4] 循环检测并下载图片 (downloadImage)
    |-- 步骤4a: 循环检测 img.image.animate.loaded 元素（最长120秒）
    |-- 步骤4b: 设置 Browser.setDownloadBehavior 允许下载
    |-- 步骤4c: Hover 到图片触发工具栏
    |-- 步骤4d: 点击 download-generated-image-button
    |-- 步骤4e: 轮询文件系统等待下载完成（最长60秒）
    |-- 步骤4f: 调用 watermark-remover 去水印
    |
[5] 删除当前会话 (deleteCurrentSession)
    |-- 点击"更多选项"按钮
    |-- 点击"删除"菜单项
    |-- 确认对话框中点击"删除"（3级策略：dialog按钮->精确匹配->宽松匹配->Enter键）
    |
[6] 等待2秒 -> 处理下一张图片
```

### 超时处理策略

当图片检测等待超过 **120 秒** 时：

```
超时 -> Page.reload(忽略缓存) -> 等待8秒
  -> Headless模式: 重新激活页面（模拟鼠标点击）
  -> checkBlankSession() 检测对话状态
    |-- 对话仍存在（有 user-query/images/messages）:
    |   |-- 继续循环检测图片（不复用新建会话）
    |-- 空白对话（无任何内容）:
        |-- 从头开始（新建会话->发提示词->检测），不删除当前会话
```

**重试规则**：
- 每张图片最多重试 **5 次**
- 超时时**不删除**当前会话
- 下载返回 null 时标记需要新建会话

## 关键技术细节

### CDP 响应结构

所有 CDP evaluate 调用的响应结构为：

```javascript
{
  id: 1,
  result: {
    result: {
      type: "object",
      value: { /* 你的返回值 */ }
    }
  }
}
// 访问方式: result.result.result.value
```

### Headless 模式注意事项

1. **offsetWidth/offsetHeight 返回 0**: Headless 模式下不可见窗口导致这些属性为 0，
   代码中**禁止使用**这些属性做可见性判断
2. **页面必须激活**: 加载完成后需调用 Page.bringToFront + 模拟鼠标点击来激活 DOM 渲染
3. **刷新后重新激活**: Page.reload 后同样需要模拟鼠标点击激活

### CSS 选择器速查

| 元素 | 选择器 |
|------|--------|
| 新建会话按钮 | `[data-test-id="new-chat-button"]` |
| 模式选择器 | `button[aria-label="打开模式选择器"]` |
| 快速模式选项 | `[data-test-id="bard-mode-option-快速"]` |
| Quill 输入框 | `div.ql-editor[contenteditable="true"][role="textbox"]` |
| 发送按钮 | `.send-button-container button.send-button` |
| 已加载图片 | `img.image.animate.loaded` / `img.image.loaded` |
| 下载按钮 | `button[data-test-id="download-generated-image-button"]` |
| 更多选项按钮 | `button[aria-label*="更多选项"]`（排除 Gem/notebook） |
| 删除选项 | `[data-test-id*="delete"]` |
| 用户消息容器 | `[class*="user-query"]` |

### 去水印模块

依赖 gemini-skill 的 `watermark-remover.js`，路径：

```
C:\Users\DELL\.codebuddy\skills\gemini-skill\src\watermark-remover.js
```

输出尺寸: **2816x1536**（移除底部 96px Gemini logo 区域）

### 固定端口与用户数据

- **调试端口**: `9222`（固定）
- **用户数据目录**: `<脚本所在目录>/gemini-user-data`（固定，保持登录状态）

## 文件结构

```
genini_web_access/
|-- SKILL.md              # 本文件
|-- scripts/
    |-- gemini_web_access.js   # 主脚本
```

## 与其他技能的关系

| 技能 | 适用场景 | 方式 |
|------|----------|------|
| **genini_web_access** (本技能) | 批量生成多张图片 | 独立 Chrome + CDP 直接操控 |
| **gemini-skill** | 单次交互/灵活组合 | Daemon + MCP 工具 |
| **baoyu-image-gen** | 多平台 API 生图 | API 调用（OpenAI/Azure/Google 等） |

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| Chrome 启动失败 | 端口 9222 被占用 | 关闭占用端口的进程 |
| 未找到新建对话按钮 | 页面未加载完全 | 增加 sleep 时间 / 检查网络 |
| 下载权限错误 | 未设置 setDownloadBehavior | 脚本已内置此命令 |
| 去水印失败 | sharp 未安装 / watermark-remover 缺失 | `npm install sharp` |
| 登录页面卡住 | 首次运行未登录 | 按提示手动登录后按 Enter 继续 |
| Headless 检测不到元素 | offsetWidth 检查导致 | 脚本已移除所有 offsetWidth 检查 |