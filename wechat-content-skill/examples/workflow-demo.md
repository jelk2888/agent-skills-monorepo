# 工作流程示例

本文档展示如何使用公众号内容创作 Skill 的完整工作流程。

---

## 示例 1：临时搜索最新 AI 动态

**场景**：想了解 Claude 3.5 的最新动态，快速获取信息用于写作。

### 用户指令

```
@wechat-content 搜索 Claude 3.5 Sonnet 最新更新
```

### AI 执行流程

1. **一次搜索**
   - 使用 WebSearch 搜索各平台内容
   - 获取最近 7 天的相关内容

2. **内容提取**
   - 筛选权威来源：Anthropic 官网、科技媒体、技术博客
   - 使用 read_url_content 获取 Top 5 文章全文

3. **深度分析**
   - 提取核心观点：功能更新、性能提升、价格变化
   - 发现信息盲区：用户实际体验、与竞品对比
   - 生成长尾词，相关词

4. **二次搜索**
   - 搜索长尾词，相关词补充细节
   - 寻找差异化角度

5. **输出结果**
   - 综合多源信息的分析报告
   - 标注信息来源

---

## 示例 2：积累选题素材

**场景**：日常关注 Sora 视频生成的进展，积累素材以备后用。

### 用户指令

```
@wechat-content 采集 Sora 视频生成
```

### AI 执行流程

1. 执行搜索和分析（同示例 1）

2. 创建选题文件 `content-library/topics/2024-01/topic-20240123-001.md`

3. 创建素材源文件 `content-library/sources/source-20240123-001.md` 等

4. 更新 `content-library/index.json`

5. 输出采集结果摘要

### 生成的文件示例

**topics/2024-01/topic-20240123-001.md**

```markdown
---
id: topic-20240123-001
title: "Sora 视频生成技术解析与应用前景"
category: AI工具
keywords: ["Sora", "视频生成", "OpenAI", "AIGC"]
sources: ["source-20240123-001", "source-20240123-002"]
status: draft
created: 2024-01-23
updated: 2024-01-23
priority: high
---

## 核心观点
- Sora 使用扩散模型 + Transformer 架构
- 支持生成最长 60 秒高清视频
- 理解物理世界的能力显著提升

## 差异化角度
- 大众忽略的点：训练数据来源的版权问题
- 与 Runway、Pika 的技术路线差异

## 相关长尾词
- Sora 发布时间
- Sora vs Runway Gen-2
- Sora 使用教程
- Sora 商用价格

## 我的思考
- 视频生成 AI 可能改变短视频行业格局
- 创作者需要适应新的工具生态
```

---

## 示例 3：从素材库创作文章

**场景**：准备写一篇关于大模型的文章，先查找已积累的素材。

### 用户指令

```
@wechat-content 查找 大模型
```

### AI 返回

```
找到 3 个相关选题：

1. [high] topic-20240120-001: GPT-5 发布预测分析
   关键词: GPT-5, OpenAI, 大模型
   
2. [medium] topic-20240115-003: 开源大模型 vs 闭源大模型
   关键词: Llama, 大模型, 开源
   
3. [low] topic-20240110-002: 大模型应用落地案例
   关键词: 大模型, 企业应用

请选择要查看的选题 ID，或输入新的关键词继续搜索。
```

### 后续操作

```
@wechat-content 撰写 topic-20240120-001
```

AI 将：
1. 读取选题和关联素材
2. 如需补充，执行临时搜索
3. 应用写作提示词生成文章

---



## 管理素材库

### 重建索引

当手动编辑了素材文件后，运行：

```bash
python scripts/search_index.py rebuild
```

### 清理归档素材

预览可清理的素材：

```bash
python scripts/search_index.py cleanup
```

实际删除：

```bash
python scripts/search_index.py cleanup --execute
```

---

## 最佳实践

1. **日常积累**：每天花 10-15 分钟采集 1-2 个选题
2. **定期清理**：每月清理 status=archived 的过期素材
3. **优先级管理**：高价值选题优先创作，避免素材过期
4. **添加思考**：每个素材都补充「我的思考」，提升原创度
5. **交叉引用**：一篇文章尽量引用 3+ 个不同来源
