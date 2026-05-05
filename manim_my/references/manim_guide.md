# Manim 完整使用指南（3b1b风格增强版）

## 目录
1. [安装与配置](#安装与配置)
2. [第一个动画](#第一个动画)
3. [完整制作SOP](#完整制作sop)
4. [场景设计模式](#场景设计模式)
5. [动画编排技巧](#动画编排技巧)
6. [响应式动画](#响应式动画)
7. [中文支持](#中文支持)
8. [字幕与配音](#字幕与配音)
9. [一句话到动画工作流](#一句话到动画工作流)
10. [代码组织最佳实践](#代码组织最佳实践)
11. [难可视化概念的降级策略](#难可视化概念的降级策略)
12. [常见问题排查](#常见问题排查)

---

## 安装与配置

### 基础安装

```bash
# ManimCommunity 版（推荐）
pip install manim

# 3b1b 原版（从 GitHub）
pip install git+https://github.com/3b1b/manim.git
```

### 完整安装（含配音和字幕）

```bash
pip install manim "manim-voiceover[gTTS]"
```

### ffmpeg 配置

Manim 依赖 ffmpeg 进行视频编码。需要 ffmpeg 支持 libx264 编码器：

```bash
# macOS（推荐使用 homebrew-ffmpeg 获取完整功能）
brew tap homebrew-ffmpeg/ffmpeg
brew install homebrew-ffmpeg/ffmpeg/ffmpeg-full

# Linux
sudo apt install ffmpeg libavcodec-extra

# Windows
# 从 https://www.gyan.dev/ffmpeg/builds/ 下载完整版
```

### 验证安装

```bash
python scripts/check_environment.py
```

---

## 第一个动画

### 最简场景

```python
from manim import *

class FirstAnimation(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle))
        self.wait()
```

### 渲染

```bash
manim -pql first.py FirstAnimation    # 低质量预览
manim -pqh first.py FirstAnimation    # 高质量输出
```

### 带文字的场景

```python
from manim import *

class HelloManim(Scene):
    def construct(self):
        title = Text("Hello, Manim!", font_size=48)
        formula = MathTex(r"E = mc^2")

        title.move_to(UP * 1.5)
        formula.move_to(DOWN * 1.5)

        self.play(Write(title))
        self.wait(0.5)
        self.play(Write(formula))
        self.wait()
```

---

## 完整制作SOP

### Phase 1: 前期准备（选题→脚本→故事板）

#### Step 1.1 本质追问

在写任何代码之前，先回答这4个问题：

```
ESSENCE_QUESTIONS = {
    "core_proposition": "用一句话说清这个概念的本质是什么？",
    "misconceptions": "观众最常见的误解是什么？",
    "best_analogy": "哪个物理/几何类比最准确？（查隐喻库）",
    "why_animate": "为什么这个概念需要动画而不是文字就能讲清？",
}
```

#### Step 1.2 脚本写作

3b1b脚本的核心结构（**绝不要从定义开始！**）：

```
┌─────────────────────────────────────────────────────┐
│  开场 (前30秒)                                       │
│  ├─ 提出激发好奇的问题（反直觉现象/悖论/日常困惑）     │
│  └─ 不要出现术语！                                   │
├─────────────────────────────────────────────────────┤
│  正文主体 (遵循 直觉→形式 循环)                       │
│  ├─ Loop 1: 具体例子 → 几何直觉建立                  │
│  ├─ Loop 2: 引入符号 → 形式化连接                     │
│  └─ Loop 3: 应用/推广                                │
├─────────────────────────────────────────────────────┤
│  收尾 (最后30-60秒)                                  │
│  ├─ 回扣开场的问题 — "现在我们能回答了"              │
│  └─ 核心洞见的一句话总结                             │
└─────────────────────────────────────────────────────┘
```

**脚本标注规范**: 在脚本中用 `[画面: ...]` 标注每句话对应的视觉描述

**字数参考**: 2000-3000字 / 10-15分钟视频（含停顿）

#### Step 1.3 故事板拆分

将脚本拆分为 Scene 列表：

```
## Scene {N}: {标题}
**时长目标**: {X}分钟
**入场元素**: {初始显示的对象列表}
**关键动作**:
  1. [{时间}] {动作描述} → 使用什么Animation
  2. [{时间}] {动作描述} → 使用什么Animation
**退场元素**: {结束时保留/消失的对象}
**转场方式**: FadeOut/FadeIn / ReplacementTransform / 相机移动
```

**Scene数量指南**:

| 视频总时长 | 推荐Scene数 | 每Scene平均时长 |
|-----------|------------|---------------|
| 1-3分钟 | 1-2 | 1-2分钟 |
| 5-10分钟 | 3-5 | 2-3分钟 |
| 10-20分钟 | 5-8 | 2-3分钟 |

#### Step 1.4 配色方案定义

使用 `Colors3B1B` 类定义配色（见 `project_template.md`），使用 `Timing` 类定义时序。

### Phase 2: 编码实现

参见「代码组织最佳实践」和 `project_template.md`。

**编码顺序原则**: `self.play() > Mobject构建 > 样式微调 > 性能优化` —— 先让它动起来！

### Phase 3: 渲染与后期

参见 SKILL.md 第三节 Phase 3。

---

## 场景设计模式

### 三段式代码组织（cigar666 风格）

每个场景的 `construct` 方法按三段式组织：

```python
class ThreePartScene(Scene):
    def construct(self):
        # ===== 1. Making Objects（创建对象）=====
        text = Text("示例", font_size=36, color=BLUE)
        circle = Circle(radius=1.5, color=YELLOW)
        bg_rect = BackgroundRectangle(text, fill_opacity=0.8)

        # ===== 2. Position（定位）=====
        text.to_edge(UP)
        circle.move_to(ORIGIN)

        # ===== 3. Showing Objects（展示动画）=====
        self.play(FadeIn(bg_rect), Write(text))
        self.play(Create(circle))
        self.wait()
```

### 分段叙事模式

```python
class NarrativeScene(Scene):
    def construct(self):
        self.introduction()
        self.main_content()
        self.conclusion()

    def introduction(self):
        title = Text("主题标题")
        self.play(Write(title))
        self.play(title.animate.to_edge(UP))
        self.wait()

    def main_content(self):
        content = VGroup(
            Text("要点一"),
            Text("要点二"),
            Text("要点三"),
        ).arrange(DOWN, buff=0.5)
        for item in content:
            self.play(FadeIn(item, shift=RIGHT))
            self.wait(0.3)

    def conclusion(self):
        summary = Text("总结")
        self.play(Write(summary))
        self.wait()
```

### 对比展示模式

```python
class ComparisonScene(Scene):
    def construct(self):
        left_title = Text("方法 A").shift(LEFT * 3 + UP * 2)
        right_title = Text("方法 B").shift(RIGHT * 3 + UP * 2)

        left_content = Circle(radius=1, color=BLUE).shift(LEFT * 3)
        right_content = Square(side_length=2, color=RED).shift(RIGHT * 3)

        divider = Line(UP * 3, DOWN * 3, color=GREY)

        self.add(divider, left_title, right_title)
        self.play(Create(left_content), Create(right_content))
        self.wait()
```

### 逐步揭示模式

```python
class StepByStepScene(Scene):
    def construct(self):
        steps = VGroup(
            Text("Step 1: 定义问题"),
            Text("Step 2: 建立模型"),
            Text("Step 3: 求解"),
            Text("Step 4: 验证"),
        ).arrange(DOWN, buff=0.8, aligned_edge=LEFT)

        for i, step in enumerate(steps):
            self.play(Write(step))
            if i < len(steps) - 1:
                arrow = Arrow(
                    steps[i].get_bottom(),
                    steps[i + 1].get_top(),
                    color=YELLOW,
                )
                self.play(GrowArrow(arrow))
            self.wait(0.5)
```

---

## 动画编排技巧

### 并行动画

```python
# 多个动画同时播放
self.play(
    FadeIn(circle),
    Write(text),
    square.animate.shift(RIGHT),
)

# 带延迟的并行动画
self.play(
    AnimationGroup(
        FadeIn(circle),
        Write(text),
        lag_ratio=0.3,
    )
)
```

### 串行动画

```python
self.play(
    Succession(
        FadeIn(circle),
        circle.animate.shift(RIGHT),
        circle.animate.scale(2),
    )
)
```

### 循环动画

```python
# 重复播放
self.play(Indicate(text), run_time=0.5)
self.play(Indicate(text), run_time=0.5)
self.play(Indicate(text), run_time=0.5)

# 使用 Repeat（社区版）
self.play(Repeat(Indicate(text), times=3))
```

### 条件动画

```python
if show_labels:
    self.play(Write(label))
else:
    self.add(label)
```

### 同时改变多种属性

```python
# 使用 .animate 语法糖
self.play(
    text.animate.shift(RIGHT * 2).scale(2).set_color(RED),
    run_time=2,
)

# 使用 save_state / restore 回溯
text.save_state()
self.play(text.animate.shift(RIGHT * 3).set_color(RED))
self.wait()
self.play(Restore(text))
```

---

## 响应式动画

### ValueTracker 模式

```python
class ResponsiveAnimation(Scene):
    def construct(self):
        tracker = ValueTracker(0)

        dot = always_redraw(
            lambda: Dot(
                RIGHT * tracker.get_value(),
                color=YELLOW,
            )
        )

        label = always_redraw(
            lambda: MathTex(
                f"x = {tracker.get_value():.1f}"
            ).next_to(dot, UP)
        )

        self.add(dot, label)
        self.play(tracker.animate.set_value(3), run_time=2)
        self.play(tracker.animate.set_value(-2), run_time=2)
```

### 参数曲线追踪

```python
class ParametricTrace(Scene):
    def construct(self):
        axes = Axes(x_range=[-5, 5], y_range=[-3, 3])

        t_tracker = ValueTracker(0)

        dot = always_redraw(
            lambda: Dot(
                axes.c2p(
                    np.cos(t_tracker.get_value()),
                    np.sin(t_tracker.get_value()),
                ),
                color=YELLOW,
            )
        )

        trail = always_redraw(
            lambda: axes.plot_parametric_curve(
                lambda t: [np.cos(t), np.sin(t)],
                t_range=[0, t_tracker.get_value()],
                color=BLUE,
            )
        )

        self.add(axes, trail, dot)
        self.play(t_tracker.animate.set_value(TAU), run_time=4)
```

### Updater 链

```python
class UpdaterChain(Scene):
    def construct(self):
        a = Dot(LEFT * 2, color=RED)
        b = Dot(RIGHT * 2, color=BLUE)
        line = Line(a.get_center(), b.get_center(), color=YELLOW)

        line.add_updater(lambda m: m.put_start_and_end_on(
            a.get_center(), b.get_center()
        ))

        self.add(a, b, line)
        self.play(a.animate.shift(UP * 2), b.animate.shift(DOWN * 2))
```

### f_always 模式（社区版）

```python
class FAlwaysExample(Scene):
    def construct(self):
        tracker = ValueTracker(1)
        circle = Circle(radius=1, color=BLUE)
        f_always(circle.set_width, tracker.get_value)
        self.add(circle)
        self.play(tracker.animate.set_value(3), run_time=2)
```

---

## 中文支持

### Text 中文

```python
title = Text("微积分基本定理", font_size=36)
```

### LaTeX 中文

```python
formula = MathTex(r"\int_a^b f(x)\,dx = F(b) - F(a)")
chinese_text = Tex(r"\text{根据牛顿-莱布尼茨公式}", tex_template=TexTemplateLibrary.ctex)
```

### 字体选择

```python
text = Text("中文内容", font="Noto Sans CJK SC")
text = Text("中文内容", font="Microsoft YaHei")
text = Text("中文内容", font="PingFang SC")
```

### 中文渐变效果

```python
text = Text("彩虹文字")
text.set_color_by_gradient(RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE)
```

---

## 字幕与配音

### 使用 manim-voiceover

```python
from manim import *
from manim_voiceover import VoiceoverScene
from manim_voiceover.services.gtts import GTTSService

class VoiceoverAnimation(VoiceoverScene):
    def construct(self):
        self.set_speech_service(GTTSService())

        title = Text("微积分入门")

        with self.voiceover(text="欢迎来到微积分入门") as tracker:
            self.play(Write(title), run_time=tracker.duration)

        circle = Circle(radius=2)

        with self.voiceover(text="这是一个圆，它的面积等于πr的平方") as tracker:
            self.play(Create(circle), run_time=tracker.duration)
```

### 字幕烧录

```bash
python scripts/run_pipeline.py \
    --scene_file scene.py \
    --scene_name VoiceoverAnimation \
    --quality high \
    --burn_subtitles
```

---

## 一句话到动画工作流

### 提示词扩展策略

当用户给出简短描述时，按以下步骤扩展：

**Step 1: 识别核心概念**
- 从用户描述中提取关键词
- 确定动画类型（变换/运动/展示/对比/模拟）

**Step 2: 五维扩展**

| 维度 | 扩展内容 | 示例 |
|------|---------|------|
| 视觉元素 | 需要哪些对象 | 坐标轴、曲线、标签、箭头 |
| 动画序列 | 对象如何出场和变化 | 先画轴→再画曲线→最后标注 |
| 数学内容 | 涉及的公式和数值 | y=sin(x), 积分公式 |
| 时间节奏 | 每步的时长 | 总15秒，每步2秒 |
| 配色方案 | 颜色分配 | 曲线=BLUE, 标签=WHITE |

**Step 3: 映射到代码模式**

| 用户意图 | 代码模式 |
|---------|---------|
| "变成/变换" | `Transform` / `ReplacementTransform` |
| "移动/运动" | `.animate.shift()` / `MoveAlongPath` |
| "增长/逼近" | `ValueTracker` + `always_redraw` |
| "展开/推导" | `Write` + 串行序列 |
| "对比/比较" | 左右分屏 + `VGroup.arrange` |
| "旋转/环绕" | `.animate.rotate()` / `Rotating` |
| "波动/振动" | `ValueTracker` + 参数曲线 |
| "收敛/极限" | `ValueTracker` 递减 + 逐帧更新 |
| "3D/立体" | `ThreeDScene` + 相机旋转 |

### 提示词扩展示例

**示例1**: "画一个圆变成正方形"
```
扩展:
- 视觉: 蓝色圆(r=2) → 红色正方形(side=4)
- 序列: 1)创建圆 2)等待0.5秒 3)变换为正方形 4)等待
- 时长: 总约4秒
- 配色: 圆=BLUE, 正方形=RED
```

**示例2**: "展示导数的几何意义"
```
扩展:
- 视觉: 坐标轴、f(x)=0.5x²-x+1曲线、切线、切点、导数标签
- 序列: 1)显示坐标轴和曲线 2)在曲线上放一个点 3)点移动时显示切线 4)标注导数值
- 数学: f'(x)=x-1
- 时长: 总约8秒
- 配色: 曲线=BLUE, 切线=RED, 点=YELLOW
```

**示例3**: "模拟弹簧振子"
```
扩展:
- 视觉: 墙壁、弹簧、方块、平衡位置虚线
- 序列: 1)显示墙壁和平衡线 2)显示弹簧和方块 3)方块开始振动
- 物理: x(t)=A*cos(ωt), ω=2, A=2
- 时长: 总约5秒(一个完整周期)
- 配色: 弹簧=WHITE, 方块=BLUE, 平衡线=GREY
```

---

## 代码组织最佳实践

### cigar666 三段式

```python
class BestPracticeScene(Scene):
    def construct(self):
        # ===== Making Objects =====
        title = Text("标题", font_size=36, color=BLUE)
        circle = Circle(radius=2, color=YELLOW)
        label = MathTex(r"x^2 + y^2 = r^2", font_size=30)
        bg = BackgroundRectangle(title, fill_opacity=0.8, buff=0.1)

        # ===== Position =====
        title.to_edge(UP)
        circle.move_to(ORIGIN)
        label.next_to(circle, DOWN, buff=0.3)

        # ===== Showing Objects =====
        self.play(FadeIn(bg), Write(title))
        self.play(Create(circle))
        self.play(Write(label))
        self.wait()
```

### 复杂场景分方法

```python
class ComplexScene(Scene):
    def construct(self):
        self.introduction()
        self.main_animation()
        self.conclusion()

    def introduction(self):
        # Making
        title = Text("复杂动画")
        # Position
        title.to_edge(UP)
        # Showing
        self.play(Write(title))
        self.play(title.animate.to_edge(UP))

    def main_animation(self):
        # Making + Position + Showing
        ...

    def conclusion(self):
        # Making + Position + Showing
        ...
```

### VGroup 组织模式

```python
class VGroupScene(Scene):
    def construct(self):
        # 将相关对象组织为 VGroup
        header = VGroup(
            Text("标题", font_size=36),
            Underline(Text("标题", font_size=36)),
        ).arrange(DOWN, buff=0.1)

        items = VGroup(
            Text("项目1"),
            Text("项目2"),
            Text("项目3"),
        ).arrange(DOWN, buff=0.5, aligned_edge=LEFT)

        # 整体定位
        header.to_edge(UP)
        items.next_to(header, DOWN, buff=0.5)

        # 批量动画
        self.play(Write(header))
        for item in items:
            self.play(FadeIn(item, shift=RIGHT * 0.5))
```

---

## 常见问题排查

### 渲染失败

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `ffmpeg libx264 not found` | ffmpeg 缺少 libx264 | 安装 ffmpeg-full |
| `LaTeX compilation error` | LaTeX 未安装或公式语法错误 | 安装 LaTeX，检查公式语法 |
| `ModuleNotFoundError: manim` | manim 未安装 | `pip install manim` |
| `No module named 'manim_voiceover'` | voiceover 未安装 | `pip install "manim-voiceover[gTTS]"` |

### 中文渲染问题

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 中文显示为方块 | 缺少中文字体 | 安装 Noto Sans CJK 或其他中文字体 |
| LaTeX 中文报错 | 未配置 ctex | 使用 `TexTemplateLibrary.ctex` |
| Text 中文乱码 | 字体不支持中文 | 指定支持中文的字体 |

### 性能优化

- 预览时使用低质量：`manim -pql`
- 使用 `self.wait()` 替代不必要的动画
- 避免在 updater 中创建新对象
- 使用 `always_redraw` 替代手动 updater
- 大量对象时使用 `VGroup` 批量操作
- 复杂场景拆分为多个小场景，最后合并

### 调试技巧

```python
# 输出调试信息
print(f"Position: {mob.get_center()}")

# 暂停检查
self.wait()

# 只渲染最后一帧
# manim -s scene.py SceneName

# 检查对象是否在场景中
if mob in self.mobjects:
    print("Object is in scene")

# 从指定动画开始渲染（调试特定片段）
# manim -n 3 scene.py SceneName -pl
```

### 常见代码错误

| 错误 | 原因 | 修复 |
|------|------|------|
| 对象不显示 | 忘记 `self.play()` 或 `self.add()` | 添加显示语句 |
| 动画一闪而过 | `self.play()` 后立即 `self.remove()` | 添加 `self.wait()` |
| updater 中创建新对象 | 导致内存泄漏 | 使用 `become()` 替代 |
| LaTeX 公式报错 | 未使用 `r"..."` 原始字符串 | 改为 `MathTex(r"formula")` |
| 中文显示异常 | 使用了 `Tex()` 而非 `Text()` | 中文用 `Text()`，公式用 `MathTex()` |

---

## 难可视化概念的降级策略

不是每个概念都适合做成炫酷动画。以下降级策略按优先级排序：

| 策略 | 适用场景 | 做法 |
|------|---------|------|
| **A. 交换图/箭头图** | 代数/范畴论/抽象结构 | 用Arrow和MathTex画交换图，展示态射关系而非几何变形 |
| **B. 分步推导动画** | 证明/计算过程 | 每步公式变化用TransformMatchingTex，强调逻辑链而非直觉 |
| **C. 概念地图** | 大量概念关联 | 用VGroup+Line构建思维导图式的静态图+逐步FadeIn |
| **D. 最小可视化** | 几乎不可视化的概念 | 仅做标题+关键词高亮，主要靠配音讲解 |
| **E. 诚实放弃** | 确实不适合 | 直接说"这个概念更适合用文字/黑板讲解"，并解释为什么 |

**原则**: 降级不等于失败。一个诚实的简单动画好过一个误导性的复杂动画。

### 降级决策树

```
概念是否可以被几何化？
├── 是 → 是否有现成隐喻？
│   ├── 是 → 使用隐喻库中的标准隐喻
│   └── 否 → 能否找到物理类比？
│       ├── 是 → 创造新隐喻（确保数学正确）
│       └── 否 → 策略A: 交换图/箭头图
└── 否 → 是否有逻辑推导过程？
    ├── 是 → 策略B: 分步推导动画
    └── 否 → 是否有概念关联？
        ├── 是 → 策略C: 概念地图
        └── 否 → 策略D或E: 最小可视化或诚实放弃
```

### 大型项目特别注意事项

当项目规模超过单Scene（10分钟以上或多个episode系列）时：

| 一致性维度 | 保障方法 |
|-----------|---------|
| **配色一致性** | config.py放在项目根目录，所有Scene import同一份Colors3B1B |
| **风格一致性** | utils.py封装所有标准创建函数，禁止在各Scene中硬编码样式参数 |
| **节奏一致性** | 所有Scene共用Timing类参数；首个Scene定调后锁定Timing不再改动 |

**渲染管线优化**:
```bash
# 开发阶段: 全部 -pql（最快）
# 内部审阅: 关键Scene用 -pqh（中等）
# 最终发布: 全部 -pqK（最慢但最高质）
```
