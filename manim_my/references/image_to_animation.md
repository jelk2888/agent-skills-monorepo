# 图片讲解视频制作参考

> 本文档提供从上传图片（包含题目和图形）到生成 Manim 讲解视频的完整工作流和模板。
> v2.4.0 新增功能。

## 目录

1. [完整工作流](#1-完整工作流)
2. [图片分析规范](#2-图片分析规范)
3. [题型分类与模板](#3-题型分类与模板)
4. [几何图形重建技术](#4-几何图形重建技术)
5. [讲解叙事模板](#5-讲解叙事模板)
6. [常见题型完整示例](#6-常见题型完整示例)
7. [图片分析提示词模板](#7-图片分析提示词模板)
8. [质量检核清单](#8-质量检核清单)

---

## 1. 完整工作流

```
用户上传图片（题目+图形）
        │
        ▼
┌─────────────────────────────────┐
│ Phase 1: 图片分析 (Image Analysis) │
│ ├─ OCR识别题目文字                  │
│ ├─ 识别数学公式和符号               │
│ ├─ 识别几何图形元素                 │
│ ├─ 识别标注（角度/长度/坐标）        │
│ └─ 判定题型类别                     │
└─────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│ Phase 2: 结构化解析 (Structured Parse) │
│ ├─ 将识别内容转为结构化数据             │
│ ├─ 提取关键数学关系和条件              │
│ ├─ 确定解题路径                       │
│ └─ 输出: ProblemStructure 对象        │
└──────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│ Phase 3: 讲解脚本生成 (Script Generation)  │
│ ├─ 按教学逻辑组织讲解步骤                  │
│ ├─ 设计"直觉→形式化"叙事结构              │
│ ├─ 标注每步对应的视觉动画                  │
│ └─ 输出: TeachingScript 对象              │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────┐
│ Phase 4: Manim代码生成 (Code Generation)   │
│ ├─ 用Manim重建图片中的图形                  │
│ ├─ 添加逐步讲解动画                        │
│ ├─ 添加标注、强调、辅助线                   │
│ └─ 输出: 完整.py文件                       │
└──────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ Phase 5: 渲染输出 (Rendering)      │
│ ├─ manim -pql 预览                │
│ ├─ 确认无误后 -pqh 高质量渲染      │
│ └─ 可选: 配音+字幕+加速           │
└──────────────────────────────────┘
```

---

## 2. 图片分析规范

### 2.1 分析输出格式

对每张上传的图片，必须输出以下结构化分析结果：

```python
class ProblemStructure:
    problem_type: str          # 题型: geometry/ algebra/ calculus/ probability/ ...
    problem_text: str          # 题目原文（OCR识别）
    conditions: list           # 已知条件列表
    question: str              # 求解目标
    figures: list              # 图形元素列表
    formulas: list             # 公式列表
    annotations: list          # 标注列表（角度/长度/坐标）
    difficulty: str            # 难度: elementary/ middle/ high/ college
    key_concepts: list         # 涉及的核心概念
    solution_steps: list       # 解题步骤（简要）
```

### 2.2 图形元素识别

| 图形元素 | 识别特征 | Manim对应类 |
|---------|---------|------------|
| 点 | 小圆点/交叉点/端点 | `Dot` |
| 线段 | 两点之间的直线 | `Line` |
| 射线 | 从一点出发的直线 | `Ray` / `Line` |
| 直线 | 无端点的直线 | `Line` |
| 圆 | 圆形曲线 | `Circle` |
| 弧 | 圆的一部分 | `Arc` / `ArcBetweenPoints` |
| 三角形 | 三条线段围成 | `Triangle` / `Polygon` |
| 矩形/正方形 | 四条线段围成 | `Rectangle` / `Square` |
| 多边形 | 多条线段围成 | `Polygon` |
| 角度标注 | 小弧线+度数 | `Angle` + `MathTex` |
| 坐标轴 | 带刻度的十字线 | `Axes` / `NumberPlane` |
| 函数曲线 | 坐标系中的曲线 | `axes.plot()` |
| 向量/箭头 | 带箭头的线段 | `Arrow` / `Vector` |
| 阴影区域 | 填充区域 | `axes.get_area()` / 填充多边形 |
| 标注文字 | 旁边的字母/数字 | `MathTex` / `Text` |

### 2.3 题型判定规则

```
图片中包含什么？
├── 几何图形（圆/三角形/多边形/线段）
│   ├── 有角度/长度标注 → 几何计算题
│   ├── 有证明要求 → 几何证明题
│   └── 有坐标/方程 → 解析几何题
├── 坐标系+函数曲线
│   ├── 单条曲线 → 函数分析题
│   ├── 多条曲线+面积 → 积分题
│   ├── 切线/法线 → 导数题
│   └── 参数变化 → 参数讨论题
├── 矩阵/向量
│   ├── 矩阵运算 → 线性代数题
│   └── 向量图 → 向量分析题
├── 数据/表格/图表
│   ├── 柱状图/饼图 → 统计题
│   └── 散点图 → 回归/概率题
├── 纯公式/方程
│   ├── 方程求解 → 代数题
│   ├── 不等式 → 不等式题
│   └── 数列/级数 → 数列题
└── 物理示意图
    ├── 力学图 → 力学题
    ├── 电路图 → 电磁学题
    └── 光路图 → 光学题
```

---

## 3. 题型分类与模板

### 3.1 几何证明/计算题

**特征**: 包含几何图形（三角形/圆/多边形）+ 角度/长度标注

**标准动画结构**:
```
1. 展示题目文字（FadeIn）
2. 逐步构建几何图形（Create 每个元素）
3. 标注已知条件（Write 标注）
4. 高亮关键条件（Indicate/Circumscribe）
5. 逐步添加辅助线（Create + 颜色区分）
6. 展示推理过程（Write 推理文字 + TransformMatchingTex 公式）
7. 高亮结论（Circumscribe + 颜色变化）
```

**配色方案**:
```python
class GeometryColors:
    GIVEN = BLUE_C          # 已知条件
    DERIVED = TEAL_C        # 推导出的结论
    AUXILIARY = YELLOW_C    # 辅助线
    RESULT = RED_C          # 最终结果
    FIGURE = WHITE          # 基本图形
    ANGLE = GREEN_C         # 角度标注
```

### 3.2 函数/微积分题

**特征**: 包含坐标系+函数曲线+面积/切线

**标准动画结构**:
```
1. 展示题目文字
2. 绘制坐标系（Create axes）
3. 绘制函数曲线（Create curve）
4. 标注关键点/区域（Dot + MathTex）
5. 展示切线/面积/极限过程（ValueTracker + always_redraw）
6. 逐步计算（Write 公式步骤）
7. 展示最终结果
```

### 3.3 代数/方程题

**特征**: 纯文字/公式，无图形

**标准动画结构**:
```
1. 展示题目（Write 题目）
2. 逐步变形（TransformMatchingTex）
3. 关键步骤高亮（Indicate/SurroundingRectangle）
4. 最终答案（颜色变化 + Circumscribe）
```

**注意**: 纯代数题缺乏几何直观，需要主动创造可视化：
- 方程求解 → 数轴上的点/函数交点
- 不等式 → 数轴上的区间
- 数列 → 坐标系中的散点+趋势

### 3.4 概率统计题

**特征**: 包含数据/表格/图表

**标准动画结构**:
```
1. 展示数据/题目
2. 可视化数据（BarChart/Table/散点图）
3. 展示计算过程
4. 展示结果
```

### 3.5 向量/线性代数题

**特征**: 包含向量图/矩阵

**标准动画结构**:
```
1. 展示向量/矩阵
2. 展示运算过程（向量加法/矩阵乘法）
3. 展示变换效果（网格变形）
4. 展示结果
```

### 3.6 物理题

**特征**: 包含物理示意图（力学/电磁/光学）

**标准动画结构**:
```
1. 展示物理情景
2. 标注已知量
3. 建立坐标系/受力分析
4. 列方程求解
5. 展示物理过程动画
```

---

## 4. 几何图形重建技术

### 4.1 从图片重建几何图形的通用方法

```python
class GeometryRebuilder:
    """
    从图片分析结果重建Manim几何图形。
    核心思路：先确定关键点坐标，再由点构建线/面/角。
    """

    @staticmethod
    def from_points(points_dict):
        """
        points_dict: {"A": [1, 2], "B": [3, 1], "C": [2, 4]}
        返回: {"A": Dot, "B": Dot, ...} + labels
        """
        dots = {}
        labels = {}
        for name, coords in points_dict.items():
            pos = np.array(coords)
            dots[name] = Dot(point=pos, color=Colors3B1B.HIGHLIGHT, radius=0.06)
            labels[name] = MathTex(name, font_size=28).next_to(dots[name], UR, buff=0.1)
        return dots, labels

    @staticmethod
    def build_triangle(A, B, C, color=WHITE):
        return Polygon(A, B, C, color=color)

    @staticmethod
    def build_circle_from_center_radius(center, radius, color=WHITE):
        return Circle(arc_center=center, radius=radius, color=color)

    @staticmethod
    def build_angle(line1, line2, radius=0.4, color=GREEN_C):
        return Angle(line1, line2, radius=radius, color=color)

    @staticmethod
    def build_auxiliary_line(start, end, color=YELLOW_C, dash=True):
        line = Line(start, end, color=color, stroke_width=2)
        if dash:
            line.set_dash([0.2, 0.1])
        return line
```

### 4.2 常见几何图形的快速构建

**三角形**:
```python
def build_labeled_triangle(A_pos, B_pos, C_pos, labels=None):
    A, B, C = np.array(A_pos), np.array(B_pos), np.array(C_pos)
    tri = Polygon(A, B, C, color=WHITE)
    dots = VGroup(*[Dot(p, radius=0.05) for p in [A, B, C]])
    if labels is None:
        labels = ["A", "B", "C"]
    label_mobs = VGroup()
    for name, pos, dot in zip(labels, [A, B, C], dots):
        direction = (pos - np.mean([A, B, C], axis=0))
        direction = direction / np.linalg.norm(direction)
        label_mobs.add(MathTex(name, font_size=28).next_to(dot, direction, buff=0.15))
    return tri, dots, label_mobs
```

**圆+切线/割线**:
```python
def build_circle_with_line(center, radius, line_start, line_end, is_tangent=False):
    circle = Circle(arc_center=center, radius=radius, color=WHITE)
    line = Line(line_start, line_end, color=BLUE_C)
    if is_tangent:
        tangent_point = center + radius * (line_end - line_start) / np.linalg.norm(line_end - line_start)
        tangent_dot = Dot(tangent_point, color=RED_C, radius=0.06)
        tangent_label = MathTex("T", font_size=24).next_to(tangent_dot, UR, buff=0.1)
        return circle, line, tangent_dot, tangent_label
    return circle, line
```

**角度标注**:
```python
def build_angle_label(line1, line2, label_text, radius=0.4):
    angle = Angle(line1, line2, radius=radius, color=GREEN_C)
    label = MathTex(label_text, font_size=24).move_to(
        angle.get_point_from_function(0.5)
    ).shift(
        (angle.get_center() - angle.get_point_from_function(0.5)) * 0.3
    )
    return angle, label
```

### 4.3 辅助线动画

```python
def add_auxiliary_line(scene, start, end, color=YELLOW_C, run_time=1.0):
    aux_line = DashedLine(start, end, color=color, dash_length=0.15)
    scene.play(Create(aux_line), run_time=run_time)
    return aux_line
```

---

## 5. 讲解叙事模板

### 5.1 通用讲解叙事结构

```
┌────────────────────────────────────────────┐
│  开场: 展示题目                              │
│  ├─ 题目文字 FadeIn                         │
│  ├─ "让我们来分析这道题"                     │
│  └─ 逐步构建图形（从已知条件出发）            │
├────────────────────────────────────────────┤
│  分析: 梳理已知条件                          │
│  ├─ 逐条高亮已知条件                         │
│  ├─ 标注关键量（颜色编码）                   │
│  └─ "我们已知什么？要求什么？"               │
├────────────────────────────────────────────┤
│  突破: 找到解题关键                          │
│  ├─ 添加辅助线/辅助元素                      │
│  ├─ 展示关键洞察（Indicate/Circumscribe）    │
│  └─ "关键在于注意到..."                      │
├────────────────────────────────────────────┤
│  推理: 逐步推导                              │
│  ├─ 每步推理配对应图形变化                   │
│  ├─ 公式逐步展示（TransformMatchingTex）     │
│  └─ "因此我们可以得到..."                    │
├────────────────────────────────────────────┤
│  结论: 展示最终答案                          │
│  ├─ 高亮最终结果                             │
│  ├─ 回扣题目要求                             │
│  └─ "所以答案是..."                          │
└────────────────────────────────────────────┘
```

### 5.2 几何题讲解叙事

```python
class GeometryExplanationTemplate(Scene):
    """
    几何题讲解叙事模板。
    使用时替换具体内容。
    """
    def construct(self):
        self.show_problem()
        self.build_figure()
        self.analyze_conditions()
        self.key_insight()
        self.step_by_step_proof()
        self.show_conclusion()

    def show_problem(self):
        problem = Text("题目文字", font="Noto Sans CJK SC", font_size=28)
        problem.to_edge(UP)
        self.play(Write(problem), run_time=2)
        self.wait(1)
        self.play(problem.animate.scale(0.6).to_corner(UL))
        self.wait(0.5)

    def build_figure(self):
        pass

    def analyze_conditions(self):
        pass

    def key_insight(self):
        pass

    def step_by_step_proof(self):
        pass

    def show_conclusion(self):
        pass
```

### 5.3 微积分题讲解叙事

```python
class CalculusExplanationTemplate(Scene):
    """
    微积分题讲解叙事模板。
    """
    def construct(self):
        self.show_problem()
        self.draw_coordinate_system()
        self.plot_function()
        self.show_process()
        self.calculate()
        self.show_result()

    def show_problem(self):
        problem = MathTex(r"\text{题目公式}")
        problem.to_edge(UP)
        self.play(Write(problem), run_time=2)
        self.wait(1)
        self.play(problem.animate.scale(0.6).to_corner(UL))

    def draw_coordinate_system(self):
        self.axes = Axes(
            x_range=[-5, 5, 1], y_range=[-3, 3, 1],
            x_length=10, y_length=6,
        )
        labels = self.axes.get_axis_labels("x", "y")
        self.play(Create(self.axes), Write(labels))

    def plot_function(self):
        pass

    def show_process(self):
        pass

    def calculate(self):
        pass

    def show_result(self):
        pass
```

---

## 6. 常见题型完整示例

### 6.1 几何证明题：三角形内角和

```python
from manim import *

class TriangleAngleSum(Scene):
    def construct(self):
        self.show_problem()
        self.build_triangle()
        self.mark_angles()
        self.demonstrate_sum()

    def show_problem(self):
        title = Text("证明：三角形内角和为180°", font="Noto Sans CJK SC", font_size=36)
        title.to_edge(UP)
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(title.animate.scale(0.6).to_corner(UL))

    def build_triangle(self):
        A = UP * 2 + LEFT * 2
        B = DOWN * 1.5 + LEFT * 3
        C = DOWN * 1.5 + RIGHT * 3

        self.triangle = Polygon(A, B, C, color=WHITE)
        self.dot_A = Dot(A, radius=0.06, color=Colors3B1B.HIGHLIGHT)
        self.dot_B = Dot(B, radius=0.06, color=Colors3B1B.HIGHLIGHT)
        self.dot_C = Dot(C, radius=0.06, color=Colors3B1B.HIGHLIGHT)

        label_A = MathTex("A", font_size=28).next_to(self.dot_A, UP, buff=0.15)
        label_B = MathTex("B", font_size=28).next_to(self.dot_B, DL, buff=0.15)
        label_C = MathTex("C", font_size=28).next_to(self.dot_C, DR, buff=0.15)

        self.play(Create(self.triangle))
        self.play(
            FadeIn(self.dot_A), FadeIn(self.dot_B), FadeIn(self.dot_C),
            Write(label_A), Write(label_B), Write(label_C),
        )
        self.wait(0.5)

    def mark_angles(self):
        line_AB = Line(self.triangle.get_vertices()[0], self.triangle.get_vertices()[1])
        line_AC = Line(self.triangle.get_vertices()[0], self.triangle.get_vertices()[2])
        line_BA = Line(self.triangle.get_vertices()[1], self.triangle.get_vertices()[0])
        line_BC = Line(self.triangle.get_vertices()[1], self.triangle.get_vertices()[2])
        line_CA = Line(self.triangle.get_vertices()[2], self.triangle.get_vertices()[0])
        line_CB = Line(self.triangle.get_vertices()[2], self.triangle.get_vertices()[1])

        angle_A = Angle(line_AB, line_AC, radius=0.5, color=BLUE_C)
        angle_B = Angle(line_BA, line_BC, radius=0.5, color=GREEN_C)
        angle_C = Angle(line_CA, line_CB, radius=0.5, color=RED_C)

        label_alpha = MathTex(r"\alpha", font_size=24, color=BLUE_C).next_to(angle_A, RIGHT, buff=0.1)
        label_beta = MathTex(r"\beta", font_size=24, color=GREEN_C).next_to(angle_B, UR, buff=0.1)
        label_gamma = MathTex(r"\gamma", font_size=24, color=RED_C).next_to(angle_C, UL, buff=0.1)

        self.play(
            Create(angle_A), Create(angle_B), Create(angle_C),
            Write(label_alpha), Write(label_beta), Write(label_gamma),
        )
        self.wait(0.5)

        self.angle_A = angle_A
        self.angle_B = angle_B
        self.angle_C = angle_C
        self.label_alpha = label_alpha
        self.label_beta = label_beta
        self.label_gamma = label_gamma

    def demonstrate_sum(self):
        aux_line = DashedLine(
            self.triangle.get_vertices()[1],
            self.triangle.get_vertices()[1] + RIGHT * 6,
            color=YELLOW_C,
        )
        self.play(Create(aux_line), run_time=1)
        self.wait(0.5)

        note = Text("过B作AC的平行线", font="Noto Sans CJK SC", font_size=24, color=YELLOW_C)
        note.next_to(aux_line, DOWN, buff=0.3)
        self.play(Write(note), run_time=1)
        self.wait(0.5)
        self.play(FadeOut(note))

        formula = MathTex(r"\alpha + \beta + \gamma = 180°", font_size=40, color=Colors3B1B.ACCENT)
        formula.to_edge(DOWN)
        self.play(Write(formula), run_time=2)
        self.play(Circumscribe(formula, color=Colors3B1B.ACCENT, buff=0.2))
        self.wait(1.5)
```

### 6.2 函数题：求函数极值

```python
from manim import *

class FindExtrema(Scene):
    def construct(self):
        self.show_problem()
        self.draw_function()
        self.find_critical_points()
        self.show_result()

    def show_problem(self):
        title = MathTex(r"f(x) = x^3 - 3x", font_size=40)
        subtitle = Text("求函数的极值", font="Noto Sans CJK SC", font_size=32)
        title.to_edge(UP)
        subtitle.next_to(title, DOWN)
        self.play(Write(title), Write(subtitle), run_time=2)
        self.wait(1)
        self.play(
            title.animate.scale(0.6).to_corner(UL),
            FadeOut(subtitle),
        )

    def draw_function(self):
        self.axes = Axes(
            x_range=[-3, 3, 1], y_range=[-4, 4, 1],
            x_length=8, y_length=6,
        )
        labels = self.axes.get_axis_labels("x", "y")
        self.curve = self.axes.plot(lambda x: x**3 - 3*x, color=BLUE_C, x_range=[-2.5, 2.5])

        self.play(Create(self.axes), Write(labels))
        self.play(Create(self.curve), run_time=2)
        self.wait(0.5)

    def find_critical_points(self):
        derivative = MathTex(r"f'(x) = 3x^2 - 3 = 0", font_size=32)
        derivative.to_edge(RIGHT).shift(UP * 1.5)
        self.play(Write(derivative))

        solutions = MathTex(r"x = \pm 1", font_size=32, color=GREEN_C)
        solutions.next_to(derivative, DOWN)
        self.play(Write(solutions))
        self.wait(0.5)

        p1 = self.axes.c2p(-1, 2)
        p2 = self.axes.c2p(1, -2)
        dot1 = Dot(p1, color=RED_C, radius=0.1)
        dot2 = Dot(p2, color=GREEN_C, radius=0.1)
        label1 = MathTex(r"(-1, 2)", font_size=24, color=RED_C).next_to(dot1, UL, buff=0.15)
        label2 = MathTex(r"(1, -2)", font_size=24, color=GREEN_C).next_to(dot2, DR, buff=0.15)

        self.play(FadeIn(dot1), FadeIn(dot2), Write(label1), Write(label2))
        self.wait(0.5)

        tangent1 = self.axes.get_secant_slope_group(
            -1, self.curve, dx=0.01, secant_line_color=RED_C
        )
        self.play(Create(tangent1))
        self.wait(0.5)
        self.play(FadeOut(tangent1))

    def show_result(self):
        result = VGroup(
            MathTex(r"x = -1: \text{极大值} f(-1) = 2", font_size=28, color=RED_C),
            MathTex(r"x = 1: \text{极小值} f(1) = -2", font_size=28, color=GREEN_C),
        ).arrange(DOWN, aligned_edge=LEFT).to_edge(DOWN)
        self.play(Write(result))
        self.play(Circumscribe(result, color=Colors3B1B.ACCENT, buff=0.15))
        self.wait(1.5)
```

### 6.3 积分题：求定积分

```python
from manim import *

class DefiniteIntegral(Scene):
    def construct(self):
        self.show_problem()
        self.draw_area()
        self.riemann_approximation()
        self.show_result()

    def show_problem(self):
        title = MathTex(r"\int_0^2 x^2 \, dx = \, ?", font_size=44)
        title.to_edge(UP)
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(title.animate.scale(0.6).to_corner(UL))

    def draw_area(self):
        self.axes = Axes(
            x_range=[-0.5, 3, 1], y_range=[-0.5, 5, 1],
            x_length=8, y_length=6,
        )
        labels = self.axes.get_axis_labels("x", "y")
        self.curve = self.axes.plot(lambda x: x**2, color=BLUE_C, x_range=[0, 2.5])

        area = self.axes.get_area(
            self.curve, x_range=[0, 2], color=BLUE_C, opacity=0.3
        )

        self.play(Create(self.axes), Write(labels))
        self.play(Create(self.curve))
        self.play(FadeIn(area))
        self.wait(0.5)

    def riemann_approximation(self):
        for n in [4, 8, 16]:
            rects = self.axes.get_riemann_rectangles(
                self.curve, x_range=[0, 2], dx=2/n, color=GREEN_C, fill_opacity=0.5
            )
            label = Text(f"n = {n}", font_size=28).to_corner(UR)
            self.play(FadeIn(rects), Write(label), run_time=1)
            self.wait(0.5)
            self.play(FadeOut(rects), FadeOut(label))

    def show_result(self):
        steps = VGroup(
            MathTex(r"= \left[ \frac{x^3}{3} \right]_0^2", font_size=36),
            MathTex(r"= \frac{2^3}{3} - \frac{0^3}{3}", font_size=36),
            MathTex(r"= \frac{8}{3}", font_size=40, color=Colors3B1B.ACCENT),
        ).arrange(DOWN, aligned_edge=LEFT).to_edge(RIGHT)

        for step in steps:
            self.play(Write(step), run_time=1.5)
            self.wait(0.5)

        self.play(Circumscribe(steps[-1], color=Colors3B1B.ACCENT, buff=0.15))
        self.wait(1.5)
```

### 6.4 代数题：二次方程求解

```python
from manim import *

class QuadraticEquation(Scene):
    def construct(self):
        self.show_problem()
        self.visualize_roots()
        self.solve_step_by_step()
        self.show_result()

    def show_problem(self):
        title = MathTex(r"2x^2 - 5x + 3 = 0", font_size=44)
        title.to_edge(UP)
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(title.animate.scale(0.6).to_corner(UL))

    def visualize_roots(self):
        axes = Axes(
            x_range=[-0.5, 3, 0.5], y_range=[-1, 4, 1],
            x_length=8, y_length=5,
        ).shift(DOWN * 0.5)
        labels = axes.get_axis_labels("x", "y")
        curve = axes.plot(lambda x: 2*x**2 - 5*x + 3, color=BLUE_C, x_range=[-0.3, 2.8])

        self.play(Create(axes), Write(labels))
        self.play(Create(curve))

        r1 = axes.c2p(1, 0)
        r2 = axes.c2p(1.5, 0)
        dot1 = Dot(r1, color=RED_C, radius=0.08)
        dot2 = Dot(r2, color=RED_C, radius=0.08)
        l1 = MathTex("x=1", font_size=24, color=RED_C).next_to(dot1, DOWN, buff=0.2)
        l2 = MathTex(r"x=\frac{3}{2}", font_size=24, color=RED_C).next_to(dot2, DOWN, buff=0.2)

        self.play(FadeIn(dot1), FadeIn(dot2), Write(l1), Write(l2))
        self.wait(0.5)

        self.axes_viz = axes

    def solve_step_by_step(self):
        steps = VGroup(
            MathTex(r"\Delta = b^2 - 4ac = 25 - 24 = 1", font_size=32),
            MathTex(r"x = \frac{-b \pm \sqrt{\Delta}}{2a} = \frac{5 \pm 1}{4}", font_size=32),
            MathTex(r"x_1 = 1, \quad x_2 = \frac{3}{2}", font_size=36, color=Colors3B1B.ACCENT),
        ).arrange(DOWN, aligned_edge=LEFT).to_edge(RIGHT).shift(DOWN * 0.5)

        for i, step in enumerate(steps):
            self.play(Write(step), run_time=1.5)
            if i < len(steps) - 1:
                self.play(Indicate(step, color=YELLOW_C))
            self.wait(0.5)

    def show_result(self):
        result = MathTex(r"x_1 = 1, \quad x_2 = \frac{3}{2}", font_size=44, color=Colors3B1B.ACCENT)
        result.to_edge(DOWN)
        self.play(Write(result))
        self.play(Circumscribe(result, color=Colors3B1B.ACCENT, buff=0.2))
        self.wait(1.5)
```

### 6.5 向量题：向量加法

```python
from manim import *

class VectorAddition(Scene):
    def construct(self):
        self.show_problem()
        self.show_vectors()
        self.show_addition()
        self.show_result()

    def show_problem(self):
        title = Text("向量加法的几何意义", font="Noto Sans CJK SC", font_size=36)
        title.to_edge(UP)
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(title.animate.scale(0.6).to_corner(UL))

    def show_vectors(self):
        origin = ORIGIN
        vec_a = Arrow(origin, RIGHT * 3 + UP * 1, buff=0, color=BLUE_C, stroke_width=4)
        vec_b = Arrow(origin, RIGHT * 1 + UP * 2.5, buff=0, color=GREEN_C, stroke_width=4)

        label_a = MathTex(r"\vec{a}", font_size=32, color=BLUE_C).next_to(vec_a, DOWN, buff=0.15)
        label_b = MathTex(r"\vec{b}", font_size=32, color=GREEN_C).next_to(vec_b, LEFT, buff=0.15)

        self.play(GrowArrow(vec_a), Write(label_a))
        self.play(GrowArrow(vec_b), Write(label_b))
        self.wait(0.5)

        self.vec_a = vec_a
        self.vec_b = vec_b

    def show_addition(self):
        vec_b_shifted = Arrow(
            self.vec_a.get_end(),
            self.vec_a.get_end() + RIGHT * 1 + UP * 2.5,
            buff=0, color=GREEN_C, stroke_width=4
        )
        self.play(
            Transform(self.vec_b.copy(), vec_b_shifted),
        )
        self.wait(0.5)

        vec_sum = Arrow(
            ORIGIN, RIGHT * 4 + UP * 3.5,
            buff=0, color=RED_C, stroke_width=5
        )
        label_sum = MathTex(r"\vec{a} + \vec{b}", font_size=32, color=RED_C).next_to(vec_sum, RIGHT, buff=0.15)

        self.play(GrowArrow(vec_sum), Write(label_sum))

        formula = MathTex(r"\vec{a} + \vec{b} = (3,1) + (1,2.5) = (4, 3.5)", font_size=28)
        formula.to_edge(DOWN)
        self.play(Write(formula))
        self.wait(1.5)

    def show_result(self):
        result = Text("平行四边形法则", font="Noto Sans CJK SC", font_size=32, color=Colors3B1B.ACCENT)
        result.to_edge(DOWN)
        self.play(Write(result))
        self.wait(1.5)
```

### 6.6 物理题：抛体运动

```python
from manim import *

class ProjectileMotion(Scene):
    def construct(self):
        self.show_problem()
        self.setup_scene()
        self.animate_trajectory()
        self.show_result()

    def show_problem(self):
        title = Text("抛体运动", font="Noto Sans CJK SC", font_size=36)
        subtitle = MathTex(r"v_0 = 20\text{m/s}, \theta = 45°", font_size=32)
        title.to_edge(UP)
        subtitle.next_to(title, DOWN)
        self.play(Write(title), Write(subtitle), run_time=2)
        self.wait(1)
        self.play(
            title.animate.scale(0.6).to_corner(UL),
            FadeOut(subtitle),
        )

    def setup_scene(self):
        self.axes = Axes(
            x_range=[0, 45, 5], y_range=[0, 15, 5],
            x_length=10, y_length=5,
        ).shift(DOWN * 1)
        labels = self.axes.get_axis_labels("x(m)", "y(m)")
        self.play(Create(self.axes), Write(labels))

        ground = Line(self.axes.c2p(0, 0), self.axes.c2p(45, 0), color=GRAY_C)
        self.add(ground)

    def animate_trajectory(self):
        v0 = 20
        theta = 45 * DEGREES
        g = 9.8

        tracker = ValueTracker(0)
        dot = always_redraw(
            lambda: Dot(
                self.axes.c2p(
                    v0 * np.cos(theta) * tracker.get_value(),
                    v0 * np.sin(theta) * tracker.get_value()
                    - 0.5 * g * tracker.get_value()**2,
                ),
                color=Colors3B1B.HIGHLIGHT, radius=0.08,
            )
        )
        trail = TracedPath(dot.get_center, stroke_color=BLUE_C, stroke_width=2)

        self.add(dot, trail)
        self.play(tracker.animate.set_value(2 * v0 * np.sin(theta) / g), run_time=4, rate_func=linear)
        self.wait(0.5)

    def show_result(self):
        results = VGroup(
            MathTex(r"T = \frac{2v_0 \sin\theta}{g} \approx 2.89\text{s}", font_size=28),
            MathTex(r"R = \frac{v_0^2 \sin 2\theta}{g} \approx 40.8\text{m}", font_size=28),
            MathTex(r"H = \frac{v_0^2 \sin^2\theta}{2g} \approx 10.2\text{m}", font_size=28),
        ).arrange(DOWN, aligned_edge=LEFT).to_edge(RIGHT)

        for result in results:
            self.play(Write(result), run_time=1.5)
            self.wait(0.3)
        self.wait(1.5)
```

---

## 7. 图片分析提示词模板

### 7.1 通用图片分析提示词

当用户上传图片时，使用以下提示词结构进行分析：

```
请分析这张数学题目图片，提取以下信息：

1. **题目文字**: 完整抄录图片中的题目文字
2. **数学公式**: 列出图片中出现的所有数学公式和符号
3. **图形元素**: 列出图片中的几何图形（点/线/圆/三角形/多边形等）
4. **标注信息**: 列出所有角度/长度/坐标标注
5. **题型判断**: 判断这是什么类型的题目（几何/代数/微积分/概率/物理/...）
6. **已知条件**: 列出所有已知条件
7. **求解目标**: 明确题目要求什么
8. **解题思路**: 给出简要的解题步骤

输出格式为 JSON：
{
  "problem_text": "...",
  "formulas": ["..."],
  "figures": [{"type": "...", "params": {...}}],
  "annotations": [{"type": "...", "value": "...", "position": "..."}],
  "problem_type": "...",
  "conditions": ["..."],
  "question": "...",
  "solution_steps": ["..."],
  "difficulty": "...",
  "key_concepts": ["..."]
}
```

### 7.2 几何题专用分析提示词

```
请分析这张几何题目图片，额外关注：

1. 所有点的标签和位置关系
2. 线段的连接关系（哪些点之间有线段）
3. 圆的圆心和半径
4. 角度的大小和位置
5. 是否有平行/垂直/相切关系
6. 是否有对称关系
7. 辅助线建议

输出关键点的坐标估计（使用Manim坐标系，中心为原点，x右正，y上正）：
{
  "points": {"A": [x, y], "B": [x, y], ...},
  "segments": [["A", "B"], ["B", "C"], ...],
  "circles": [{"center": "O", "radius": r, "through": ["A", "B"]}],
  "angles": [{"vertex": "A", "rays": ["AB", "AC"], "value": "60°"}],
  "relations": ["AB ∥ CD", "EF ⊥ GH", ...],
  "auxiliary_lines": ["连接AC", "作BD的垂线", ...]
}
```

### 7.3 函数/微积分题专用分析提示词

```
请分析这张函数/微积分题目图片，额外关注：

1. 坐标系的范围和刻度
2. 函数曲线的形状和关键特征（极值/拐点/渐近线）
3. 阴影区域的边界
4. 切线/法线的位置
5. 特殊点的坐标

输出：
{
  "axes_range": {"x": [min, max, step], "y": [min, max, step]},
  "functions": [{"expression": "...", "color_hint": "...", "x_range": [...]}],
  "shaded_areas": [{"between": [...], "x_range": [...]}],
  "tangent_lines": [{"at_x": ..., "function_index": ...}],
  "special_points": [{"type": "extremum/inflection/zero", "x": ..., "y": ...}]
}
```

---

## 8. 质量检核清单

### 图片分析阶段
- [ ] 题目文字完整识别（无遗漏）
- [ ] 数学公式准确提取（符号无错误）
- [ ] 图形元素全部识别（点/线/面/角）
- [ ] 标注信息完整（角度/长度/坐标）
- [ ] 题型判断正确

### 图形重建阶段
- [ ] 重建图形与原图一致（形状/比例/位置）
- [ ] 所有关键点坐标正确
- [ ] 标注位置合理（不遮挡/不重叠）
- [ ] 辅助线用虚线+不同颜色区分

### 讲解叙事阶段
- [ ] 遵循"直觉→形式化"结构
- [ ] 每步推理有对应视觉变化
- [ ] 关键洞察有强调动画
- [ ] 节奏有呼吸感（不是一直动不停）
- [ ] 最终答案清晰醒目

### 技术质量
- [ ] 代码可直接运行无报错
- [ ] 颜色编码一致（已知=蓝/推导=青/辅助=黄/结论=红）
- [ ] 字体大小适当（标题>正文>标注）
- [ ] 动画时长合理（总时长1-5分钟）
