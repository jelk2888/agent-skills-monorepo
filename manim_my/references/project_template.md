# Manim 项目模板

> 本文档提供完整的 Manim 项目结构模板，包括 config.py、utils.py 和 Scene 模板。
> 适用于中等和复杂任务（3分钟以上视频）。简单任务可直接使用单文件模式。

---

## 1. 项目目录结构

```
project_name/
├── config.py              # ★ 配色+时序常量（所有Scene共享）
├── utils.py               # ★ 工具函数（所有Scene共享）
├── main.py                # 入口文件（import所有scene用于统一渲染）
└── scenes/
    ├── 01_introduction.py
    ├── 02_core_concept.py
    ├── 03_example.py
    ├── 04_deeper_dive.py
    └── 05_conclusion.py
```

---

## 2. config.py 模板

```python
from manim import *


class Colors3B1B:
    """3b1b标准配色方案 — 同一概念全视频同色！"""

    # === 概念语义色（根据具体项目调整映射关系）===
    INPUT = BLUE_C           # 输入量/初始状态/向量
    OUTPUT = TEAL_C          # 输出量/变换结果
    ACCENT = RED_C           # 强调/警告/重点标注
    TRANSFORM = PURPLE_C     # 变换操作/矩阵/算子
    HIGHLIGHT = GOLD_C       # 特征值/特殊常数/重要发现

    # === 结构性颜色（固定不变）===
    TEXT = WHITE             # 所有文本
    GRID = GRAY_C            # 坐标网格线
    AXIS = GRAY              # 坐标轴
    BACKGROUND = "#1e1e2e"   # 深色背景

    # === 临时色（用于非重复出现的元素）===
    TEMP_A = GREEN_C
    TEMP_B = ORANGE
    TEMP_C = MAROON_C


class Timing:
    """标准动画时序参数"""

    # 出现/消失
    FADE = 0.7
    SHOW_CREATE = 1.5
    WRITE_PER_CHAR = 0.08
    GROW = 0.8

    # 变形/移动
    TRANSFORM = 1.2
    MOVE = 1.0
    ROTATE = 1.2

    # 停顿（★最重要★）
    PAUSE_SHORT = 0.5        # 信息之间
    PAUSE_MEDIUM = 1.0       # 重要信息后
    PAUSE_LONG = 1.5         # 段落结束/关键洞察

    # 密度控制
    MAX_ACTIVE_ELEMENTS = 5
    NEW_INFO_INTERVAL = 4.0  # 秒


FONT = {
    "tex": "Latin Modern Math",
    "text": "Sans-serif",
}
```

---

## 3. utils.py 模板

```python
from manim import *
from config import Colors3B1B, Timing


def standard_axes(x_range=(-7, 7, 1), y_range=(-4, 4, 1), **kwargs):
    """创建标准3b1b风格坐标系"""
    return Axes(
        x_range=x_range,
        y_range=y_range,
        axis_config={
            "include_tip": True,
            "tip_length": 0.15,
            "color": Colors3B1B.AXIS,
        },
        background_line_style={
            "stroke_color": Colors3B1B.GRID,
            "stroke_width": 1,
            "stroke_opacity": 0.4,
        },
        **kwargs
    )


def labeled_vector(end, label_text="", color=None, **kwargs):
    """创建带标签的标准向量箭头"""
    if color is None:
        color = Colors3B1B.INPUT
    vec = Arrow(
        ORIGIN, end,
        buff=0,
        max_tip_to_length_ratio=0.15,
        color=color,
        stroke_width=4,
        **kwargs
    )
    if label_text:
        lbl = MathTex(label_text).scale(0.7).next_to(vec.get_end(), UR).set_color(color)
        return VGroup(vec, lbl)
    return vec


def highlight_box(mobject, color=None, buff=0.1):
    """创建高亮边框（用于强调重点区域）"""
    if color is None:
        color = Colors3B1B.ACCENT
    return SurroundingRectangle(mobject, color=color, buff=buff)


def fade_in_with_pause(mobjects, pause_after=True):
    """渐入后自动停顿（常用组合）"""
    if not isinstance(mobjects, list):
        mobjects = [mobjects]
    actions = [FadeIn(m) for m in mobjects]
    if pause_after:
        actions.append(Wait(Timing.PAUSE_SHORT))
    return actions


def transform_with_label(obj_a, obj_b, label_text="", label_color=None):
    """变形过渡 + 标签更新（最常用的叙事手法）"""
    transform_anim = ReplacementTransform(obj_a, obj_b)
    if label_text:
        label = MathTex(label_text)
        if label_color:
            label.set_color(label_color)
        return [transform_anim, FadeIn(label)]
    return [transform_anim]


def create_title(text, scale=1.0):
    """创建标准标题（白色大号）"""
    return Tex(rf"\textbf{{{text}}}").scale(scale).set_color(Colors3B1B.TEXT)


def create_number_plane(**kwargs):
    """创建标准3b1b风格坐标平面（含网格）"""
    return NumberPlane(
        x_range=(-7, 7, 1),
        y_range=(-4, 4, 1),
        background_line_style={
            "stroke_color": Colors3B1B.GRID,
            "stroke_width": 1,
            "stroke_opacity": 0.3,
        },
        **kwargs
    )
```

---

## 4. Scene 模板

### 4.1 标准Scene模板

```python
# scenes/XX_scene_name.py
from manim import *
from config import Colors3B1B, Timing
from utils import standard_axes, labeled_vector, highlight_box, create_title


class SceneName(Scene):
    def construct(self):
        # ===== 1. 背景设置 =====

        # ===== 2. 放入静态元素 =====
        axes = standard_axes()
        title = create_title("Scene标题")
        self.add(axes, title)

        # ===== 3. 逐步构建动态内容 =====
        # --- Act 1: 引入 ---
        obj1 = SomeMobject().set_color(Colors3B1B.INPUT)
        self.play(FadeIn(obj1), run_time=Timing.FADE)
        self.wait(Timing.PAUSE_SHORT)

        # --- Act 2: 变形/变化 ---
        obj2 = AnotherMobject()
        self.play(ReplacementTransform(obj1, obj2), run_time=Timing.TRANSFORM)
        self.wait(Timing.PAUSE_MEDIUM)

        # --- Act 3: 强调重点 ---
        box = highlight_box(obj2)
        self.play(Create(box), run_time=Timing.SHOW_CREATE * 0.5)
        self.wait(Timing.PAUSE_LONG)

        # ===== 4. 收尾 =====
```

### 4.2 线性代数Scene模板

```python
from manim import *
from config import Colors3B1B, Timing
from utils import create_number_plane, labeled_vector, highlight_box, create_title


class LinearTransformationDemo(Scene):
    def construct(self):
        # ===== Making =====
        title = create_title("线性变换")
        plane = create_number_plane()
        i_vec = Arrow(ORIGIN, RIGHT, color=Colors3B1B.INPUT, stroke_width=4, buff=0)
        j_vec = Arrow(ORIGIN, UP, color=Colors3B1B.OUTPUT, stroke_width=4, buff=0)
        i_label = MathTex(r"\hat{i}").next_to(i_vec.get_end(), DOWN).set_color(Colors3B1B.INPUT)
        j_label = MathTex(r"\hat{j}").next_to(j_vec.get_end(), RIGHT).set_color(Colors3B1B.OUTPUT)
        matrix_text = MathTex(r"\begin{pmatrix} 2 & 1 \\ 0 & 1 \end{pmatrix}")
        matrix_text.set_color(Colors3B1B.TRANSFORM).to_edge(RIGHT)

        # ===== Position =====
        title.to_edge(UP)

        # ===== Showing =====
        self.play(Write(title))
        self.play(title.animate.to_edge, UP)
        self.play(FadeIn(plane), run_time=Timing.FADE)
        self.play(GrowArrow(i_vec), FadeIn(i_label))
        self.wait(Timing.PAUSE_SHORT)
        self.play(GrowArrow(j_vec), FadeIn(j_label))
        self.wait(Timing.PAUSE_MEDIUM)

        self.play(FadeIn(matrix_text))
        self.wait(Timing.PAUSE_SHORT)

        self.play(
            plane.animate.apply_matrix([[2, 1], [0, 1]]),
            run_time=Timing.TRANSFORM * 1.5,
        )
        self.wait(Timing.PAUSE_LONG)
```

### 4.3 微积分Scene模板

```python
from manim import *
from config import Colors3B1B, Timing
from utils import standard_axes, highlight_box, create_title


class DerivativeWithZoom(Scene):
    def construct(self):
        # ===== Making =====
        func = lambda x: np.sin(x) * x
        axes = standard_axes(x_range=[-5, 5, 1], y_range=[-3, 3, 1])
        graph = axes.plot(func, color=Colors3B1B.INPUT)
        graph_label = MathTex(r"f(x) = x \cdot \sin(x)").scale(0.7).next_to(graph, UP)
        zoom_point = axes.c2p(1.5, func(1.5))
        dot = Dot(zoom_point, color=Colors3B1B.ACCENT)

        # ===== Position =====

        # ===== Showing =====
        self.play(FadeIn(axes), Create(graph), Write(graph_label))
        self.wait(Timing.PAUSE_MEDIUM)

        self.play(FadeIn(dot))
        self.wait(Timing.PAUSE_SHORT)

        tangent = TangentLine(graph, alpha=0.45, length=2, color=Colors3B1B.ACCENT)
        slope_val = MathTex(r"f'(x) \approx 0.8").next_to(tangent, DOWN).set_color(Colors3B1B.ACCENT)
        self.play(Create(tangent), Write(slope_val))
        self.wait(Timing.PAUSE_LONG)
```

---

## 5. main.py 模板

```python
"""项目入口文件 - 渲染所有Scene"""

# 方式1: 直接import（manim会自动发现所有Scene类）
from scenes.01_introduction import Introduction
from scenes.02_core_concept import CoreConcept
from scenes.03_example import Example
from scenes.04_deeper_dive import DeeperDive
from scenes.05_conclusion import Conclusion

# 方式2: 不需要import，直接用命令渲染单个Scene
# manim -pql scenes/01_introduction.py Introduction
```

---

## 6. 大型项目特别注意事项

### 6.1 跨Scene一致性保障

| 一致性维度 | 保障方法 |
|-----------|---------|
| **配色一致性** | config.py放在项目根目录，所有Scene import同一份Colors3B1B |
| **风格一致性** | utils.py封装所有标准创建函数，禁止在各Scene中硬编码样式参数 |
| **字体一致** | 在config.py的FONT字典中统一设置 |
| **节奏一致性** | 所有Scene共用Timing类参数；首个Scene定调后锁定Timing不再改动 |

### 6.2 渲染管线优化

```bash
# 策略1: 并行渲染各Scene
# Windows PowerShell:
Get-ChildItem scenes\*.py | ForEach-Object { Start-Process manim -ArgumentList "-pqk","$($_.FullName)","SceneName" }

# 策略2: 渲染缓存 — 只重新渲染修改过的Scene
# 项目结构中为每个Scene建立独立文件的好处：manim可以只编译变化的文件

# 策略3: 分级渲染
# 开发阶段: 全部 -pql
# 内部审阅: 关键Scene用 -pqh
# 最终发布: 全部 -pqK
```

### 6.3 版本控制规范

```bash
git commit -m "feat: scene-01 intro skeleton"
git commit -m "style: timing adjustments scene-02"
git commit -m "fix: color scheme consistency"
```

**重要文件不提交**: `media/`、`__pycache__/`、`.manim_cache/`（加入 `.gitignore`）
