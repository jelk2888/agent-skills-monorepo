# WeChat Content Skill (wechat-content-skill)

这是一个专为微信公众号创作者设计的 **AI Agent Skill**。它不是一个简单的工具箱，而是一个具备"深度思考"能力的创作助理。

它能帮你完成从 **全网搜集** -> **素材整理** -> **深度写作** 的全流程，并且内置了一套 **"反转驱动"** 的深度写作系统，拒绝生成平庸的 AI 水文。

## 核心能力

### 1. 深度搜集与整理 (Deep Research)
- **自动采集**：基于关键词，自动从 Google/Web 搜索高质量信息源（自动过滤低质内容）。
- **智能建库**：自动将搜集到的信息整理为 `Topic` (选题) 和 `Source` (素材源)，并存入 `content-library`。
- **自动索引**：通过 `index.json` 自动维护本地知识库，越用越聪明。

### 2. 深度写作系统 (Deep Writing)
这不是简单的 "扩写"，而是基于 **"反转思维" (Reversal Thinking)** 的创作：
- **寻找敌人**：每篇文章必须有一个对立面，避免"正确的废话"。
- **制造反转**：核心逻辑是 "你以为是 A，其实是 B"。
- **一次生成 3 篇**：针对同一个选题，自动生成 3 篇不同切入点的完整文章草稿，供你选择。

## 快速开始

### 1. 安装
将本项目克隆到你的 AI 编辑器/IDE 的 Skill 管理目录下：
```bash
git clone https://github.com/CheeMao/wechat-content-skill.git
```

### 2. 加载与使用
本项目兼容支持 Agentic Workflow 的编辑器：

#### **在 Antigravity (IDE) 中使用**
- 确保 Settings 中已加载 Skills 目录。
- 直接在对话框输入指令即可激活。

#### **在 Claude Code / Cursor / Trae 中使用**
- **Claude Code**: 在项目根目录运行 `claude`，直接对话即可。
- **Cursor/Trae**: 将整个文件夹作为 Context (上下文) 拖入，配合 Composer (Ctrl+I/Cmd+I) 使用。

## 指令说明

Skill 定义了 4 种标准工作模式，你可以通过 `@wechat-content` (或直接自然语言) 触发：

### 🎯 模式 A：临时搜索
> "我想了解一下 Claude 3.5 的最新情况"
- **指令**：`@wechat-content 搜索 [关键词]`
- **作用**：快速联网搜索，提取核心观点，不保存到本地库。

### 📥 模式 B：素材积累 (核心)
> "帮我收集关于 Sora 的资料，我要写文章用"
- **指令**：`@wechat-content 采集 [关键词]`
- **作用**：联网搜索 -> 深度分析 -> **自动创建本地素材文件** (存入 `content-library`)。

### 🔍 模式 C：调用素材
> "看看我库里有没有关于大模型的资料"
- **指令**：`@wechat-content 查找 [关键词]`
- **作用**：从本地 `content-library` 中检索已有素材。

### ✍️ 模式 D：深度创作 (核心)
> "基于收集到的 Sora 资料，帮我写文章"
- **指令**：`@wechat-content 撰写 [选题关键词]`
- **作用**：
    1. 自动调取相关素材（如果不足会自动联网补充）。
    2. **自动构思 3 个不同的"反转"角度**。
    3. 直接输出 3 篇完整的文章草稿（包含标题、正文）。
    4. 全程静默执行，直接给结果。

## 目录结构
```text
wechat-content-skill/
├── SKILL.md                # 核心大脑：定义了所有的 Prompt 和工作流
├── content-library/        # 你的本地知识库 (自动生成，已加入 .gitignore)
│   ├── topics/             # 整理好的选题卡片
│   ├── sources/            # 原始素材片段
│   └── index.json          # 知识库索引
├── templates/              # 内部使用的结构定义 (用户无需手动修改)
└── scripts/                # 辅助脚本
```

## 常见问题

**Q: 为什么生成的文章有时候很犀利？**
A: `SKILL.md` 中内置了"去 AI 味"和"寻找敌人"的规则，强制 AI 在写作时寻找冲突和反转，模拟资深自媒体人的思维。

**Q: 我需要手动改 templates 目录下的文件吗？**
A: **不需要**。那是给 AI 看的结构定义。你只需要对 AI 下达 "采集" 或 "撰写" 的指令，它会自动处理所有文件操作。

## 授权说明
MIT License
