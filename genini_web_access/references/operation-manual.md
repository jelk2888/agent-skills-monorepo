# Gemini Web Access 操作说明文档

## 快速开始

### 首次使用前

1. **安装 Node.js 依赖**

在项目目录或技能脚本目录下执行：
```bash
npm install ws sharp
```

2. **首次登录 Google 账号**

首次运行时脚本会启动浏览器窗口并打开 Gemini 页面：

- 如果检测到登录页面，脚本会暂停并提示："请在打开的浏览器中登录 Google 账号，然后按 Enter 键继续"
- 登录后按 Enter 键继续，登录状态会被保存在 `gemini-user-data/` 目录中
- 之后运行无需再次登录

### 基本使用

```bash
# 进入脚本所在目录
cd d:\公众号

# Headless 模式（默认）- 后台运行不弹窗
node gemini_web_access.js test_configs.json "output"

# 非 Headless 模式 - 弹出浏览器窗口
node gemini_web_access.js test_configs.json "output" --no-headless

# 查看帮助信息
node gemini_web_access.js
```

### 配置文件

配置文件为 JSON 数组格式，每个对象包含 `prompt` 和 `outputName` 两个字段：

```json
[
  {
    "prompt": "中国苏州园林中的古典亭台楼阁，烟雨蒙蒙",
    "outputName": "suzhou_garden.png"
  },
  {
    "prompt": "中国敦煌莫高窟内景，飞天壁画",
    "outputName": "dunhuang_mogao.png"
  }
]
```

> 注意：你只需写图片描述词。脚本会自动在提示词前加上"帮我生成图片："，在后面加上"，分辨率4K"。

### 提示词编写建议

**推荐写法（只写描述词）：**
```json
{"prompt": "中国大熊猫幼崽在竹林中嬉戏", "outputName": "panda_bamboo.png"}
```

**不推荐的写法（重复前缀）：**
```json
{"prompt": "帮我生成图片：中国大熊猫幼崽在竹林中嬉戏，分辨率4K", "outputName": "..."}
// 实际发送会变成："帮我生成图片：帮我生成图片：中国大熊猫幼崽在竹林中嬉戏，分辨率4K，分辨率4K"
```

**提示词优化建议：**
- 添加风格描述：如"水墨画风格"、"赛博朋克风格"、"写实照片风格"
- 添加光线信息：如"清晨阳光"、"逆光"、"霓虹灯光"
- 添加天气/氛围：如"烟雨蒙蒙"、"大雪纷飞"、"星空背景"
- 指定人物特征：如"中国人形象"、"穿着传统汉服"

## 运行模式对比

| 特性 | Headless 模式 | 非 Headless 模式 |
|------|--------------|-----------------|
| 浏览器窗口 | 无 | 弹出可见窗口 |
| 运行速度 | 较快 | 稍慢 |
| 适用场景 | 批量任务 / 自动化 | 调试 / 观察运行过程 |
| 启动命令 | 不加参数或使用 `--headless` | 加 `--no-headless` |

## 完整工作流程

每张图片自动生成时经历以下步骤：

1. **新建会话** - 点击 Gemini 页面左上角新建聊天按钮
2. **切换快速模式** - 打开模式选择器，切换到"快速"模型
3. **发送提示词** - 自动添加"帮我生成图片："前缀和"，分辨率4K"后缀
4. **检测图片** - 循环检测生成的图片（最长 120 秒）
5. **下载图片** - Hover 图片 → 点击下载按钮 → 等待文件写入
6. **去水印** - 自动移除 Gemini logo（输出 2816×1536 像素）
7. **重命名** - 按配置文件的 `outputName` 重命名
8. **删除会话** - 点击更多选项 → 删除 → 确认
9. **等待间隔** - 等待 2 秒后处理下一张

## 超时处理

当图片生成等待超过 120 秒时：

1. **自动刷新页面** - 忽略缓存刷新
2. **等待 8 秒** - Headless 模式下模拟鼠标点击激活页面
3. **检测对话状态**：
   - 如果对话仍存在（有用户消息/图片/回复）→ 继续循环检测图片
   - 如果空白对话（无任何内容）→ 从头开始重新发送提示词
4. **最多重试 5 次** - 超时时不会删除当前会话

## 断点续传

脚本支持自动跳过已存在的图片：

- 如果输出目录中已经存在同名文件，该图片会被自动跳过
- 运行日志会显示：`⏭️ 跳过 [X] xxx.png (已存在)`
- 修改配置文件后只生成新增的图片

## 输出目录

- 指定输出目录：运行命令时第二个参数
- 输出目录不存在时会自动创建
- 每张图片去水印后以 `outputName` 命名保存到输出目录

## 登录状态管理

- **固定用户数据目录**：脚本所在目录下的 `gemini-user-data/`
- 登录状态持久保存，关闭浏览器后下次运行无需重新登录
- 如需重新登录：关闭 Chrome 后删除 `gemini-user-data/` 目录，下次运行会要求登录

## 常见问题

### Chrome 启动失败

**原因**：端口 9222 被占用

**解决**：
```bash
# Windows: 查找并关闭占用端口的进程
netstat -ano | findstr 9222
taskkill /F /PID <进程PID>
```

### 未找到新建对话按钮

**原因**：页面未完全加载或网络异常

**解决**：
- 检查网络连接
- 使用非 Headless 模式观察页面加载：`node gemini_web_access.js configs.json "output" --no-headless`
- 手动刷新 Gemini 页面后重新运行

### 下载权限错误

**原因**：脚本已内置 `Browser.setDownloadBehavior` 命令，此错误应极少出现

**解决**：
- 确保 Chrome 版本在 85 以上
- 使用最新版本脚本

### 去水印失败

**原因**：sharp 库未安装 或 watermark-remover.js 路径不正确

**解决**：
```bash
npm install sharp
```

### Headless 模式检测不到元素

**原因**：旧版本代码使用了 `offsetWidth` 做可见性判断（Headless 下返回 0）

**解决**：当前版本已修复，确保使用最新脚本

### 登录页面卡住

**原因**：首次运行未登录 Google 账号

**解决**：
1. 脚本启动后会暂停并提示"请在打开的浏览器中登录 Google 账号"
2. 在浏览器中完成 Google 登录
3. 在终端中按 Enter 键继续

## 命令行参数汇总

```
node gemini_web_access.js <configs> <output> [选项]

参数:
  configs   JSON 配置文件路径
  output    图片输出目录

选项:
  --headless       无窗口模式（默认）
  --no-headless    弹出浏览器窗口模式
```

## 技术架构

- **通信协议**：Chrome DevTools Protocol (CDP) via WebSocket
- **浏览器管理**：独立 Chrome 实例启动 → 完成任务后关闭
- **下载行为**：`Browser.setDownloadBehavior` CDP 命令允许自动下载
- **去水印**：Sharp 图像处理库，移除底部 96px 的 Gemini logo 区域
- **富文本编辑**：Quill Editor（`execCommand insertText` 方式输入）
- **固定调试端口**：9222

## 文件说明

```
gemini_web_access/
├── SKILL.md                    # 技能说明文档
├── .gitignore                  # Git 忽略规则
├── package.json                # Node.js 依赖声明
├── scripts/
│   ├── gemini_web_access.js    # 主脚本
│   └── example_batch.json      # 示例配置（5张中国风图片）
└── references/
    ├── selectors.md            # CSS 选择器速查表
    ├── config-format.md        # 配置文件格式说明
    └── operation-manual.md     # 操作说明文档（本文件）
```
