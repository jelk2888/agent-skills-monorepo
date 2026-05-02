# Agent Skills Monorepo

## 📚 简介

这是一个整合了多种AI助手技能的仓库，收集并整理了来自 Claude、Cursor 和 Agents 平台的各类实用技能。所有技能都直接放在根目录下，便于查找和使用。

## 📋 技能目录

### 🔧 开发与工具类

| 技能名称 | 功能描述 |
|---------|---------|
| **babysit** | 代码助手，帮助监控和管理代码任务 |
| **canvas** | 创建交互式 React 应用，用于构建分析性工件和可视化 |
| **create-hook** | 创建自定义钩子的技能 |
| **create-rule** | 创建规则的技能 |
| **create-skill** | 创建新技能的专业工具，包含评估和优化功能 |
| **create-subagent** | 创建子代理的技能 |
| **migrate-to-skills** | 迁移到技能系统的工具 |
| **shell** | 命令行 Shell 操作技能 |
| **split-to-prs** | 将工作分割为多个 Pull Request 的工具 |
| **statusline** | 状态栏相关操作 |
| **update-cli-config** | 更新 CLI 配置 |
| **update-cursor-settings** | 更新 Cursor 设置 |

### 🎨 设计与创作类

| 技能名称 | 功能描述 |
|---------|---------|
| **aetherviz-master** | 互动教育可视化建筑师，将任意教学主题转化为极致美观、高度交互的专业教学网页（支持 SVG + Three.js） |
| **frontend-design** | 创建独特、高质量的前端界面和网页组件，支持多种设计风格 |
| **baoyu-article-illustrator** | 分析文章结构，识别需要配图的位置，使用 Type × Style × Palette 三维方法生成插图 |
| **baoyu-image-gen** | AI 图像生成，支持 OpenAI、Azure OpenAI、Google、OpenRouter、DashScope、MiniMax、Jimeng、Seedream 和 Replicate 等多种 API |
| **baoyu-slide-deck** | 从内容生成专业的幻灯片图像，支持多种风格和布局 |

### 📝 内容创作类

| 技能名称 | 功能描述 |
|---------|---------|
| **khazix-writer** | 数字生命卡兹克的公众号长文写作技能，适用于撰写高质量文章 |
| **wewrite** | 微信公众号内容全流程助手：热点抓取 → 选题 → 框架 → 内容增强 → 写作 → SEO → 视觉 AI → 排版推送 |
| **wechat-content-skill** | 公众号内容创作助手 - 帮助高效采集素材、筛选选题、创作优质文章（支持 4 种工作模式，深度写作系统） |
| **xiaohu-wechat-cover** | 公众号封面图生成器，一键生成美观的封面图 |
| **xiaohu-wechat-format-main** | 公众号一键排版，将任意文本内容转化为微信公众号兼容的排版格式 |

### 📊 数据与内容处理类

| 技能名称 | 功能描述 |
|---------|---------|
| **baoyu-url-to-markdown** | 获取 URL 并转换为 Markdown，支持多种网站和内容类型 |
| **web-access** | 联网操作技能，包括搜索、网页抓取、登录后操作、网络交互等 |
| **agent-reach** | 多平台网络访问技能，支持 Twitter、YouTube、Bilibili、小红书、抖音、微信公众号、LinkedIn、GitHub、Reddit 等 13+ 平台的搜索和内容读取 |
| **wechat-article-downloader** | 微信公众号文章下载器，支持多种格式下载 |
| **wechat-download** | 微信内容下载工具 |

### 🤖 AI 与模型集成类

| 技能名称 | 功能描述 |
|---------|---------|
| **gemini-skill** | 通过 Gemini 官网执行生图、对话等操作的技能 |
| **gemini-webapi-mcp** | 使用 Google Gemini 进行图像生成、文本聊天、文件分析、URL/YouTube 分析和多轮对话 |
| **genini_web_access** | Gemini 网页访问技能 |
| **notebooklm** | 直接从 Claude Code 查询 Google NotebookLM 笔记本，获取基于文档的可靠答案 |

### 💼 效率与自动化类

| 技能名称 | 功能描述 |
|---------|---------|
| **automation-workflows** | 设计和实现自动化工作流，帮助独立创业者节省时间和扩大运营规模，支持 Zapier、Make、n8n 等工具 |
| **planning-with-files** | 实现 Manus 风格的基于文件的规划，组织和跟踪复杂多步骤任务 |
| **self-improving-agent** | 通用自我提升代理，从所有技能经验中学习，持续改进代码库 |
| **skills-vetter** | 技能安全审核工具，验证 Claude Code 技能的安全性 |
| **using-superpowers** | 使用超能力的技能，开始任何对话时使用 |
| **karpathy-guidelines** | Andrej Karpathy 的行为准则，用于减少常见的 LLM 编码错误 |
| **find-skills** | 帮助用户发现和安装代理技能 |

### 🧠 记忆与上下文管理类

| 技能名称 | 功能描述 |
|---------|---------|
| **claude-memory** | 创建和优化 CLAUDE.md 记忆文件或 .claude/rules/ 模块化规则，提高 Claude Code 的上下文感知能力 |

### 🧪 测试与调试类

| 技能名称 | 功能描述 |
|---------|---------|
| **webapp-testing** | 与本地 Web 应用交互和测试的工具包，使用 Playwright 验证前端功能 |

---

## 🚀 使用方法

### 通用使用步骤

1. **查看技能文档**：每个技能目录下都有 `SKILL.md` 文件，包含了详细的功能说明和使用指南
2. **技能触发词**：大多数技能都有特定的触发词，在对话中使用这些词会自动激活相应技能
3. **按需调用**：根据具体任务需求，直接使用对应的技能

### 各技能具体使用

#### Aetherviz Master（互动教育可视化）
- **触发词**：可视化、教学动画、Three.js、SVG 等
- **功能**：将任意教学主题转化为沉浸式 3D 交互教学网页
- **支持**：物理、化学、生物、数学、天文、编程等多学科

#### Automation Workflows（自动化工作流）
- **触发词**：automate、automation、workflow automation、save time、reduce manual work、automate my business、no-code automation
- **功能**：识别自动化机会，设计跨工具工作流，设置触发器和动作
- **工具**：Zapier、Make、n8n

#### Baoyu Article Illustrator（文章配图）
- **触发词**：illustrate article、add images、generate images for article、为文章配图
- **功能**：分析文章，智能识别需要配图的位置，生成风格一致的插图

#### Baoyu Image Gen（图像生成）
- **触发词**：generate、create、draw images
- **功能**：支持多种图像生成 API 的统一接口
- **注意**：此技能已迁移到 baoyu-imagine

#### Baoyu Slide Deck（幻灯片生成）
- **触发词**：create slides、make a presentation、generate deck、slide deck、PPT
- **功能**：将内容转化为专业的幻灯片图像

#### WeWrite（微信公众号写作）
- **触发词**：公众号、推文、微信文章、微信推文、草稿箱、微信排版、选题、热搜、热点抓取、封面图、配图、写公众号
- **功能**：微信公众号内容全流程助手

#### WeChat Content Skill（微信内容创作）
- **触发词**：@wechat-content 搜索、@wechat-content 采集、@wechat-content 查找、@wechat-content 撰写
- **核心能力**：
  1. **内容采集**：搜索 + 采集 + 深度分析
  2. **素材管理**：积累 + 索引 + 快速调用
  3. **深度写作**：反转驱动 + 观点锋利 + 一次生成 3 篇
- **工作模式**：
  - **模式 A（临时搜索）**：@wechat-content 搜索 [关键词] - 实时搜索分析话题
  - **模式 B（素材积累）**：@wechat-content 采集 [关键词] - 自动化采集存入素材库
  - **模式 C（调用素材）**：@wechat-content 查找 [关键词] - 搜索已有素材
  - **模式 D（创作文章）**：@wechat-content 撰写 [选题ID或关键词] - 一次生成3篇不同角度文章
- **特色**：内置深度写作系统，注重观点反转、信息增量，避免低价值内容

---

## 📂 目录结构

```
agent-skills-monorepo/
├── aetherviz-master/              # 互动教育可视化
├── automation-workflows/          # 自动化工作流
├── babysit/                       # 代码助手
├── baoyu-article-illustrator/     # 文章配图
├── baoyu-image-gen/               # 图像生成
├── baoyu-slide-deck/              # 幻灯片生成
├── baoyu-url-to-markdown/         # URL 转 Markdown
├── canvas/                        # React 画布
├── claude-memory/                 # Claude 记忆
├── create-hook/                   # 创建钩子
├── create-rule/                   # 创建规则
├── create-skill/                  # 创建技能
├── create-subagent/               # 创建子代理
├── find-skills/                   # 查找技能
├── frontend-design/               # 前端设计
├── gemini-skill/                  # Gemini 技能
├── gemini-webapi-mcp/             # Gemini WebAPI MCP
├── genini_web_access/             # Gemini 网页访问
├── karpathy-guidelines/           # Karpathy 准则
├── khazix-writer/                 # 卡兹克写作
├── migrate-to-skills/             # 迁移到技能
├── notebooklm/                    # NotebookLM
├── planning-with-files/           # 文件规划
├── self-improving-agent/          # 自我提升代理
├── shell/                         # Shell 操作
├── skill-creator/                 # 技能创建
├── skills-vetter/                 # 技能审核
├── split-to-prs/                  # 分割 PR
├── statusline/                    # 状态栏
├── update-cli-config/             # 更新 CLI 配置
├── update-cursor-settings/        # 更新 Cursor 设置
├── using-superpowers/             # 使用超能力
├── web-access/                    # 网页访问
├── agent-reach/                   # 多平台网络访问
├── webapp-testing/                # Web 应用测试
├── wechat-article-downloader/     # 微信文章下载
├── wechat-content-skill/          # 微信内容创作（来自 ModelScope）
├── wechat-download/               # 微信下载
├── wewrite/                       # 微信写作
├── xiaohu-wechat-cover/           # 微信封面
├── xiaohu-wechat-format-main/     # 微信排版
├── .gitignore                     # Git 忽略文件
└── README.md                      # 本文件
```

---

## 🔄 与 GitHub 同步

### 删除原仓库（如果存在）

```bash
# 使用 GitHub CLI 删除仓库
gh repo delete YOUR_USERNAME/agent-skills-monorepo --yes
```

### 初始化并上传新仓库

```bash
cd d:\公众号\agent-skills-monorepo

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "Initial commit: Merge all skills from claude-skills, agents-skills, and cursor-skills"

# 创建 GitHub 仓库
gh repo create agent-skills-monorepo --private --source=. --remote=origin --push
```

或者，如果仓库已在 GitHub 上创建：

```bash
git remote add origin https://github.com/YOUR_USERNAME/agent-skills-monorepo.git
git branch -M main
git push -u origin main
```

---

## ⚠️ 注意事项

1. **重复技能**：已清理重复技能，保留功能更完整的版本
2. **API 密钥**：部分技能需要配置 API 密钥，请参考各技能目录下的配置说明
3. **环境变量**：某些技能可能需要设置环境变量，请查看各技能的 `SKILL.md`
4. **安全配置**：请确保不要将真实的 API 密钥、密码等敏感信息提交到仓库

---

## 📞 贡献与反馈

如果您发现问题或有改进建议，欢迎提出 Issue 或 Pull Request。

---

## 📄 许可证

请参考各技能目录下的许可证文件。

---

**最后更新**：2026年4月