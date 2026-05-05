# Manim Community 动画示例参考

> 来源: https://docs.manim.community/en/stable/examples.html + GitHub 仓库 + 社区教程
> 本文档收录 Manim Community 官方示例库及社区精选动画模式，按功能分类整理。
> 每个示例均可直接复制运行。

## 目录
1. [创建动画 (Creation)](#1-创建动画-creation)
2. [淡入淡出动画 (Fade)](#2-淡入淡出动画-fade)
3. [生长动画 (Growing)](#3-生长动画-growing)
4. [指示动画 (Indication)](#4-指示动画-indication)
5. [移动动画 (Movement)](#5-移动动画-movement)
6. [变换动画 (Transform)](#6-变换动画-transform)
7. [旋转动画 (Rotation)](#7-旋转动画-rotation)
8. [文本与公式 (Text & Math)](#8-文本与公式-text--math)
9. [高级 Mobject](#9-高级-mobject)
10. [图论 (Graph)](#10-图论-graph)
11. [表格 (Table)](#11-表格-table)
12. [相机与3D (Camera & 3D)](#12-相机与3d-camera--3d)
13. [特效与工具 (Special Effects)](#13-特效与工具-special-effects)
14. [坐标系绘图 (Plotting)](#14-坐标系绘图-plotting)
15. [布尔运算 (Boolean Operations)](#15-布尔运算-boolean-operations)
16. [流线与向量场 (StreamLines & VectorField)](#16-流线与向量场动画-streamlines--vectorfield)
17. [LaggedStart 延迟启动](#17-laggedstart-延迟启动动画)
18. [NumberPlane 非线性变换](#18-numberplane-非线性变换)
19. [ApplyPointwiseFunction 复数变换](#19-applypointwisefunction-复数变换)
20. [完整教学案例](#20-完整教学案例)
21. [交互模式与调试](#21-交互模式与调试)
22. [中文字体处理](#22-中文字体处理)
23. [配置系统](#23-配置系统)
24. [项目初始化命令](#24-项目初始化命令)
25. [微积分教学动画](#25-微积分教学动画)
26. [傅里叶级数可视化](#26-傅里叶级数可视化)
27. [神经网络可视化](#27-神经网络可视化)
28. [梯度下降动画](#28-梯度下降动画)
29. [函数变换动画](#29-函数变换动画)
30. [Matrix 高级用法](#30-matrix-高级用法)
31. [AnimationGroup 动画组合](#31-animationgroup-动画组合)
32. [apply_complex_function 复数函数变换](#32-apply_complex_function-复数函数变换)

---

## 1. 创建动画 (Creation)

### ShowPassingFlash — 闪光通过效果

```python
class ShowPassingFlashExample(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        self.play(ShowPassingFlash(circle, time_width=0.5))
        self.wait()
```

### ShowCreationThenDestruction — 创建后销毁

```python
class ShowCreationThenDestructionExample(Scene):
    def construct(self):
        square = Square(side_length=2, color=RED)
        self.play(ShowCreationThenDestruction(square))
        self.wait()
```

### ShowCreationThenFadeOut — 创建后淡出

```python
class ShowCreationThenFadeOutExample(Scene):
    def construct(self):
        triangle = Triangle(color=GREEN).scale(2)
        self.play(ShowCreationThenFadeOut(triangle))
        self.wait()
```

### DrawBorderThenFill — 先画边框再填充

```python
class DrawBorderThenFillExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=BLUE, fill_opacity=1)
        self.play(DrawBorderThenFill(square, run_time=3))
        self.wait()
```

### SpiralIn — 螺旋进入

```python
class SpiralInExample(Scene):
    def construct(self):
        text = Text("SpiralIn", font_size=72)
        self.play(SpiralIn(text, scale_factor=0.5))
        self.wait()
```

### AddTextLetterByLetter — 逐字添加文字

```python
class AddTextLetterByLetterExample(Scene):
    def construct(self):
        text = Text("Hello Manim!", font_size=48)
        self.play(AddTextLetterByLetter(text, time_per_char=0.1))
        self.wait()
```

### RemoveTextLetterByLetter — 逐字移除文字

```python
class RemoveTextLetterByLetterExample(Scene):
    def construct(self):
        text = Text("Goodbye!", font_size=48)
        self.add(text)
        self.play(RemoveTextLetterByLetter(text, time_per_char=0.1))
        self.wait()
```

### Unwrite — 反向书写

```python
class UnwriteExample(Scene):
    def construct(self):
        text = Text("Unwrite", font_size=72)
        self.play(Write(text))
        self.wait(0.5)
        self.play(Unwrite(text))
        self.wait()
```

---

## 2. 淡入淡出动画 (Fade)

### FadeIn 带方向参数

```python
class FadeInDirections(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=BLUE, fill_opacity=1)
        self.play(FadeIn(square, shift=UP, scale=1.5))
        self.wait()
```

### FadeInFromPoint — 从指定点淡入

```python
class FadeInFromPointExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=GREEN, fill_opacity=1)
        self.play(FadeInFromPoint(square, point=LEFT * 3 + DOWN * 2))
        self.wait()
```

### FadeInFromLarge — 从大缩小淡入

```python
class FadeInFromLargeExample(Scene):
    def construct(self):
        circle = Circle(radius=1, fill_color=RED, fill_opacity=1)
        self.play(FadeInFromLarge(circle, scale_factor=3))
        self.wait()
```

### FadeOutAndShift — 淡出并位移

```python
class FadeOutAndShiftExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=BLUE, fill_opacity=1)
        self.add(square)
        self.play(FadeOutAndShift(square, direction=UP))
        self.wait()
```

### FadeOutToPoint — 淡出到指定点

```python
class FadeOutToPointExample(Scene):
    def construct(self):
        circle = Circle(radius=1.5, fill_color=YELLOW, fill_opacity=1)
        self.add(circle)
        self.play(FadeOutToPoint(circle, point=LEFT * 3 + UP * 2))
        self.wait()
```

---

## 3. 生长动画 (Growing)

### GrowFromEdge — 从边缘生长

```python
class GrowFromEdgeExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=ORANGE, fill_opacity=0.8)
        self.play(GrowFromEdge(square, edge=UP))
        self.wait()
```

### SpinInFromNothing — 旋转出现

```python
class SpinInFromNothingExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=PURPLE, fill_opacity=0.8)
        self.play(SpinInFromNothing(square))
        self.wait()
```

### GrowArrow — 箭头生长

```python
class GrowArrowExample(Scene):
    def construct(self):
        arrow = Arrow(LEFT * 3, RIGHT * 3, color=YELLOW, buff=0)
        self.play(GrowArrow(arrow))
        self.wait()
```

### ShrinkToCenter — 缩小到中心

```python
class ShrinkToCenterExample(Scene):
    def construct(self):
        square = Square(side_length=2, fill_color=TEAL, fill_opacity=0.8)
        self.add(square)
        self.play(ShrinkToCenter(square))
        self.wait()
```

---

## 4. 指示动画 (Indication)

### FocusOn — 聚焦高亮

```python
class FocusOnExample(Scene):
    def construct(self):
        square = Square(side_length=2)
        self.add(square)
        self.play(FocusOn(square))
        self.wait()
```

### Indicate — 指示闪烁

```python
class IndicateExample(Scene):
    def construct(self):
        text = Text("Important!", font_size=48)
        self.add(text)
        self.play(Indicate(text, color=YELLOW, scale_factor=1.3))
        self.wait()
```

### Flash — 闪光效果

```python
class FlashExample(Scene):
    def construct(self):
        dot = Dot(ORIGIN, color=RED)
        self.add(dot)
        self.play(Flash(dot, color=YELLOW, line_length=1, flash_radius=0.5))
        self.wait()
```

### ApplyWave — 波浪效果

```python
class ApplyWaveExample(Scene):
    def construct(self):
        text = Text("Wave!", font_size=48)
        self.add(text)
        self.play(ApplyWave(text))
        self.wait()
```

### Circumscribe — 环绕框

```python
class CircumscribeExample(Scene):
    def construct(self):
        text = Text("Key Point", font_size=36)
        self.add(text)
        self.play(Circumscribe(text, Circle, fade_out=True, color=YELLOW))
        self.wait()
```

### ShowPassingFlashAround — 闪光环绕

```python
class ShowPassingFlashAroundExample(Scene):
    def construct(self):
        square = Square(side_length=2)
        self.add(square)
        self.play(ShowPassingFlashAround(square, time_width=0.5, color=YELLOW))
        self.wait()
```

### ShowCreationThenDestructionAround — 创建后销毁环绕

```python
class ShowCreationThenDestructionAroundExample(Scene):
    def construct(self):
        text = Text("Temporary", font_size=36)
        self.add(text)
        self.play(ShowCreationThenDestructionAround(text, color=RED))
        self.wait()
```

### ShowCreationThenFadeAround — 创建后淡出环绕

```python
class ShowCreationThenFadeAroundExample(Scene):
    def construct(self):
        text = Text("Highlight", font_size=36)
        self.add(text)
        self.play(ShowCreationThenFadeAround(text, color=GREEN))
        self.wait()
```

### Wiggle — 摇晃效果

```python
class WiggleExample(Scene):
    def construct(self):
        arrow = Arrow(ORIGIN, RIGHT * 2, color=YELLOW)
        self.add(arrow)
        self.play(Wiggle(arrow, scale_value=1.3, rotation_angle=0.1))
        self.wait()
```

---

## 5. 移动动画 (Movement)

### MoveAlongPath — 沿路径移动

```python
class MoveAlongPathExample(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        dot = Dot(color=YELLOW)
        self.add(circle, dot)
        self.play(MoveAlongPath(dot, circle), run_time=3, rate_func=linear)
        self.wait()
```

### MoveToTarget — 移动到目标

```python
class MoveToTargetExample(Scene):
    def construct(self):
        square = Square(color=BLUE)
        self.add(square)
        square.generate_target()
        square.target.shift(RIGHT * 3).set_color(RED).scale(2)
        self.play(MoveToTarget(square))
        self.wait()
```

### PhaseFlow — 相位流

```python
class PhaseFlowExample(Scene):
    def construct(self):
        plane = NumberPlane()
        dot = Dot(LEFT + UP, color=YELLOW)
        self.add(plane, dot)
        self.play(
            PhaseFlow(
                lambda pos: np.array([pos[1], -pos[0], 0]),
                dot,
                run_time=3,
            )
        )
        self.wait()
```

---

## 6. 变换动画 (Transform)

### ClockwiseTransform / CounterclockwiseTransform

```python
class ClockwiseTransformExample(Scene):
    def construct(self):
        square = Square(color=BLUE)
        circle = Circle(color=RED)
        square.shift(LEFT * 2)
        circle.shift(RIGHT * 2)
        self.add(square, circle)
        self.play(ClockwiseTransform(square, circle))
        self.wait()
```

### CyclicReplace — 循环替换

```python
class CyclicReplaceExample(Scene):
    def construct(self):
        dots = VGroup(
            Dot(LEFT, color=BLUE),
            Dot(ORIGIN, color=GREEN),
            Dot(RIGHT, color=RED),
        ).scale(1.5)
        self.add(dots)
        self.play(CyclicReplace(*dots))
        self.wait()
```

### Swap — 交换

```python
class SwapExample(Scene):
    def construct(self):
        dot1 = Dot(LEFT * 2, color=BLUE)
        dot2 = Dot(RIGHT * 2, color=RED)
        self.add(dot1, dot2)
        self.play(Swap(dot1, dot2))
        self.wait()
```

### FadeTransform — 淡入变换

```python
class FadeTransformExample(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=1)
        circle = Circle(color=RED, fill_opacity=1)
        self.add(square)
        self.play(FadeTransform(square, circle))
        self.wait()
```

### FadeTransformPieces — 分片淡入变换

```python
class FadeTransformPiecesExample(Scene):
    def construct(self):
        src = VGroup(Square(), Circle()).arrange(RIGHT, buff=1)
        dst = VGroup(Circle(), Square()).arrange(RIGHT, buff=1)
        self.add(src)
        self.play(FadeTransformPieces(src, dst))
        self.wait()
```

### ApplyMethod — 应用方法动画

```python
class ApplyMethodExample(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=1)
        self.add(square)
        self.play(ApplyMethod(square.shift, RIGHT * 3))
        self.wait()
```

### ApplyPointwiseFunction — 逐点函数应用

```python
class ApplyPointwiseFunctionExample(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5)
        self.add(square)
        self.play(
            ApplyPointwiseFunction(
                lambda p: p + 0.5 * np.array([p[1], -p[0], 0]),
                square,
            )
        )
        self.wait()
```

### TransformMatchingShapes — 智能匹配形状变换

```python
class TransformMatchingShapesExample(Scene):
    def construct(self):
        src = VGroup(Circle(), Square(), Triangle()).arrange(RIGHT, buff=1)
        dst = VGroup(Triangle(), Circle(), Square()).arrange(RIGHT, buff=1)
        self.add(src)
        self.play(TransformMatchingShapes(src, dst))
        self.wait()
```

### TransformMatchingTex — 按TeX字符串匹配变换

```python
class TransformMatchingTexExample(Scene):
    def construct(self):
        eq1 = MathTex("a", "+", "b", "=", "c")
        eq2 = MathTex("c", "-", "b", "=", "a")
        self.play(Write(eq1))
        self.play(TransformMatchingTex(eq1, eq2))
        self.wait()
```

---

## 7. 旋转动画 (Rotation)

### Rotate — 旋转

```python
class RotateExample(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5)
        self.add(square)
        self.play(Rotate(square, angle=PI / 2, about_point=ORIGIN))
        self.wait()
```

### Rotating — 持续旋转

```python
class RotatingExample(Scene):
    def construct(self):
        square = Square(color=YELLOW, fill_opacity=0.5)
        self.add(square)
        self.play(Rotating(square, radians=TAU, about_point=ORIGIN, run_time=3))
        self.wait()
```

### 带路径弧的 Transform

```python
class TransformPathArcExample(Scene):
    def construct(self):
        dot1 = Dot(LEFT * 2, color=BLUE)
        dot2 = Dot(RIGHT * 2, color=RED)
        self.add(dot1)
        self.play(Transform(dot1, dot2, path_arc=PI / 2))
        self.wait()
```

---

## 8. 文本与公式 (Text & Math)

### Text 样式控制

```python
class TextStyleDemo(Scene):
    def construct(self):
        t1 = Text("Normal", font_size=36)
        t2 = Text("Italic", slant=ITALIC, font_size=36)
        t3 = Text("Bold", weight=BOLD, font_size=36)
        t4 = Text("Colored", color=RED, font_size=36)
        t5 = Text("Gradient").set_color_by_gradient(RED, BLUE, GREEN)

        group = VGroup(t1, t2, t3, t4, t5).arrange(DOWN, buff=0.5)
        self.play(Write(group))
        self.wait()
```

### Text 切片着色

```python
class TextColorSlice(Scene):
    def construct(self):
        text = Text("Hello World", font_size=48)
        text[0:5].set_color(RED)
        text[5:].set_color(BLUE)
        self.play(Write(text))
        self.wait()
```

### Text 行距与宽度

```python
class TextLayoutDemo(Scene):
    def construct(self):
        t1 = Text("Line 1\nLine 2\nLine 3", line_spacing=1.5, font_size=30)
        t2 = Text("Constrained Width", width=4, font_size=30)
        group = VGroup(t1, t2).arrange(RIGHT, buff=1)
        self.play(Write(group))
        self.wait()
```

### MarkupText — 标记文本

```python
class MarkupTextDemo(Scene):
    def construct(self):
        text = MarkupText(
            '<b>Bold</b> <i>Italic</i> <u>Underline</u> '
            '<span fgcolor="red">Red</span> '
            '<span size="x-large">Big</span>'
        )
        self.play(Write(text))
        self.wait()
```

### MathTex 索引着色

```python
class MathTexColorDemo(Scene):
    def construct(self):
        formula = MathTex(
            r"\int_0^\infty", r"e^{-x^2}", r"dx", r"=", r"\frac{\sqrt{\pi}}{2}"
        )
        formula[0].set_color(RED)
        formula[1].set_color(BLUE)
        formula[4].set_color(GOLD)
        self.play(Write(formula))
        self.wait()
```

### MathTex set_color_by_tex

```python
class TexColorByTex(Scene):
    def construct(self):
        formula = MathTex(
            r"x^2", r"+", r"2xy", r"+", r"y^2", r"=", r"(x+y)^2"
        )
        formula.set_color_by_tex("x", RED)
        formula.set_color_by_tex("y", GREEN)
        self.play(Write(formula))
        self.wait()
```

### Matrix — 矩阵显示

```python
class MatrixDemo(Scene):
    def construct(self):
        m = Matrix(
            [[1, 2, 3],
             [4, 5, 6],
             [7, 8, 9]],
            left_bracket="(",
            right_bracket=")",
        )
        m.set_column_colors(RED, GREEN, BLUE)
        self.play(Write(m))
        self.wait()
```

### DecimalNumber — 可变数字

```python
class DecimalNumberDemo(Scene):
    def construct(self):
        tracker = ValueTracker(0)
        number = DecimalNumber(0, num_decimal_places=2, font_size=72)
        number.add_updater(lambda m: m.set_value(tracker.get_value()))
        self.add(number)
        self.play(tracker.animate.set_value(100), run_time=3)
        self.play(tracker.animate.set_value(-50), run_time=2)
        self.wait()
```

### Code — 代码高亮显示

```python
class CodeDemo(Scene):
    def construct(self):
        code = Code(
            "from manim import *\n\nclass Demo(Scene):\n    def construct(self):\n        self.play(Write(Text('Hello')))",
            language="python",
            font_size=24,
        )
        self.play(FadeIn(code))
        self.wait()
```

### Paragraph — 段落

```python
class ParagraphDemo(Scene):
    def construct(self):
        para = Paragraph(
            "First line of text",
            "Second line of text",
            "Third line of text",
            line_spacing=1.5,
            font_size=30,
        )
        self.play(Write(para))
        self.wait()
```

---

## 9. 高级 Mobject

### ArcPolygon — 弧形多边形

```python
class ArcPolygonDemo(Scene):
    def construct(self):
        arc_poly = ArcPolygon(
            Arc(radius=2, start_angle=0, angle=PI / 2),
            Arc(radius=2, start_angle=PI / 2, angle=PI / 2),
            Arc(radius=2, start_angle=PI, angle=PI / 2),
            Arc(radius=2, start_angle=3 * PI / 2, angle=PI / 2),
            color=BLUE,
            fill_opacity=0.5,
        )
        self.play(Create(arc_poly))
        self.wait()
```

### Trapezoid — 梯形

```python
class TrapezoidDemo(Scene):
    def construct(self):
        trap = Trapezoid(
            height=2, width_top=3, width_bottom=5, color=BLUE, fill_opacity=0.5
        )
        self.play(Create(trap))
        self.wait()
```

### AnnularSector — 环形扇区

```python
class AnnularSectorDemo(Scene):
    def construct(self):
        sector = AnnularSector(
            inner_radius=1, outer_radius=2, angle=PI / 3, fill_opacity=0.5, color=BLUE
        )
        self.play(Create(sector))
        self.wait()
```

### Sector — 扇区

```python
class SectorDemo(Scene):
    def construct(self):
        sector = Sector(
            outer_radius=2, inner_radius=0, angle=PI / 3, fill_opacity=0.5, color=GREEN
        )
        self.play(Create(sector))
        self.wait()
```

### Cutout — 镂空

```python
class CutoutDemo(Scene):
    def construct(self):
        s1 = Square(fill_color=BLUE, fill_opacity=1).scale(2)
        s2 = Square(fill_color=RED, fill_opacity=1).scale(1)
        s3 = Square(fill_color=GREEN, fill_opacity=1).scale(0.5)
        cutout = Cutout(s1, s2, s3, fill_opacity=0.8, color=WHITE)
        self.play(Create(cutout))
        self.wait()
```

### Star — 星形

```python
class StarDemo(Scene):
    def construct(self):
        star = Star(n=5, outer_radius=2, inner_radius=1, color=YELLOW, fill_opacity=0.5)
        self.play(Create(star))
        self.wait()
```

### Annulus — 环形

```python
class AnnulusDemo(Scene):
    def construct(self):
        annulus = Annulus(inner_radius=1, outer_radius=2, color=BLUE, fill_opacity=0.5)
        self.play(Create(annulus))
        self.wait()
```

### RoundedRectangle — 圆角矩形

```python
class RoundedRectangleDemo(Scene):
    def construct(self):
        rect = RoundedRectangle(
            width=4, height=2, corner_radius=0.5, color=BLUE, fill_opacity=0.5
        )
        self.play(Create(rect))
        self.wait()
```

### DashedVMobject — 虚线

```python
class DashedVMobjectDemo(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        dashed = DashedVMobject(circle, num_dashes=20)
        self.play(Create(dashed))
        self.wait()
```

### CurvesAsSubmobjects — 曲线子对象

```python
class CurvesAsSubmobjectsDemo(Scene):
    def construct(self):
        curve = ParametricFunction(
            lambda t: np.array([np.cos(t), np.sin(t), 0]),
            t_range=[0, TAU],
            color=BLUE,
        )
        curves = CurvesAsSubmobjects(curve)
        curves.set_color_by_gradient(RED, YELLOW, GREEN, BLUE, PURPLE)
        self.play(Create(curves))
        self.wait()
```

---

## 10. 图论 (Graph)

### 基本图创建

```python
class GraphExample(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4, 5, 6]
        edges = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 6), (6, 1), (1, 3)]
        g = Graph(vertices, edges, layout="circular", labels=True)
        self.play(Create(g))
        self.wait()
```

### 图布局选择

```python
class GraphLayoutDemo(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4, 5]
        edges = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 1), (1, 3)]

        g_circular = Graph(vertices, edges, layout="circular", labels=True)
        g_spring = Graph(vertices, edges, layout="spring", labels=True)
        g_tree = Graph(vertices, edges, layout="tree", root_vertex=1, labels=True)

        g_circular.shift(LEFT * 4)
        g_spring.shift(UP * 2)
        g_tree.shift(RIGHT * 4)

        labels = VGroup(
            Text("circular", font_size=24).next_to(g_circular, DOWN),
            Text("spring", font_size=24).next_to(g_spring, DOWN),
            Text("tree", font_size=24).next_to(g_tree, DOWN),
        )

        self.play(Create(g_circular), Create(g_spring), Create(g_tree), Write(labels))
        self.wait()
```

### 自定义顶点位置

```python
class GraphCustomLayoutDemo(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4]
        edges = [(1, 2), (2, 3), (3, 4), (4, 1)]
        layout = {
            1: LEFT * 2 + UP,
            2: RIGHT * 2 + UP,
            3: RIGHT * 2 + DOWN,
            4: LEFT * 2 + DOWN,
        }
        g = Graph(vertices, edges, layout=layout, labels=True)
        self.play(Create(g))
        self.wait()
```

### 图的边和顶点着色

```python
class GraphColoringDemo(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4, 5]
        edges = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 1), (1, 3)]
        g = Graph(vertices, edges, layout="circular", labels=True)

        g.vertices[1].set_color(RED)
        g.vertices[2].set_color(GREEN)
        g.vertices[3].set_color(BLUE)

        g.edges[(1, 2)].set_color(YELLOW)
        g.edges[(2, 3)].set_color(ORANGE)

        self.play(Create(g))
        self.wait()
```

### 有向图

```python
class DirectedGraphDemo(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4]
        edges = [(1, 2), (2, 3), (3, 4), (4, 1), (1, 3)]
        g = Graph(
            vertices,
            edges,
            layout="circular",
            labels=True,
            edge_type=Arrow,
            edge_config={"tip_length": 0.15},
        )
        self.play(Create(g))
        self.wait()
```

### 图的动画操作

```python
class GraphAnimationDemo(Scene):
    def construct(self):
        vertices = [1, 2, 3, 4, 5]
        edges = [(1, 2), (2, 3), (3, 4), (4, 5), (5, 1)]
        g = Graph(vertices, edges, layout="circular", labels=True)
        self.play(Create(g))

        self.play(g.vertices[1].animate.set_color(RED).scale(1.5))
        self.play(g.edges[(1, 2)].animate.set_color(YELLOW).set_stroke(width=5))

        self.play(
            g.vertices[3].animate.move_to(RIGHT * 3 + UP * 2),
            run_time=1,
        )
        self.wait()
```

---

## 11. 表格 (Table)

### Table — 基本表格

```python
class TableDemo(Scene):
    def construct(self):
        table = Table(
            [["1", "2", "3"],
             ["4", "5", "6"],
             ["7", "8", "9"]],
            row_labels=[Text("R1"), Text("R2"), Text("R3")],
            col_labels=[Text("C1"), Text("C2"), Text("C3")],
        )
        self.play(Create(table))
        self.wait()
```

### MathTable — 数学表格

```python
class MathTableDemo(Scene):
    def construct(self):
        table = MathTable(
            [[r"\alpha", r"\beta", r"\gamma"],
             [r"\delta", r"\epsilon", r"\zeta"],
             [r"\eta", r"\theta", r"\iota"]],
        )
        self.play(Create(table))
        self.wait()
```

### MobjectTable — Mobject 表格

```python
class MobjectTableDemo(Scene):
    def construct(self):
        table = MobjectTable(
            [[Circle(radius=0.3), Square(side_length=0.6)],
             [Triangle(), Star(n=5, outer_radius=0.3)]],
        )
        self.play(Create(table))
        self.wait()
```

### 表格着色

```python
class TableColorDemo(Scene):
    def construct(self):
        table = Table(
            [["A", "B", "C"],
             ["D", "E", "F"],
             ["G", "H", "I"]],
        )
        table.get_entries().set_color(BLUE)
        table.get_entries((1, 1)).set_color(RED)
        table.get_entries((2, 2)).set_color(GREEN)
        table.get_entries((3, 3)).set_color(YELLOW)
        self.play(Create(table))
        self.wait()
```

### 表格对齐与缩放

```python
class TableAlignmentDemo(Scene):
    def construct(self):
        table = Table(
            [["Short", "Medium Text", "Very Long Text Here"],
             ["A", "BB", "CCC"]],
        ).scale(0.7)
        self.play(Create(table))
        self.wait()
```

---

## 12. 相机与3D (Camera & 3D)

### MovingCameraScene — 移动相机

```python
class MovingCameraDemo(MovingCameraScene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5).shift(LEFT * 3)
        circle = Circle(color=RED, fill_opacity=0.5).shift(RIGHT * 3)
        self.add(square, circle)

        self.play(self.camera.frame.animate.move_to(square))
        self.wait(0.5)
        self.play(self.camera.frame.animate.move_to(circle))
        self.wait(0.5)
        self.play(self.camera.frame.animate.move_to(ORIGIN))
        self.wait()
```

### 相机缩放

```python
class CameraZoomDemo(MovingCameraScene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5)
        self.add(square)
        self.play(self.camera.frame.animate.set_width(square.width * 3))
        self.wait(0.5)
        self.play(self.camera.frame.animate.set_width(square.width * 0.8))
        self.wait(0.5)
        self.play(self.camera.frame.animate.set_width(square.width * 3))
        self.wait()
```

### ThreeDScene — 3D 场景

```python
class ThreeDSceneDemo(ThreeDScene):
    def construct(self):
        axes = ThreeDAxes()
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)
        self.add(axes)

        sphere = Sphere(radius=1, color=BLUE, fill_opacity=0.5).shift(UP)
        cube = Cube(side_length=1, color=RED, fill_opacity=0.5).shift(RIGHT * 2)
        cone = Cone(base_radius=0.5, height=1, color=GREEN, fill_opacity=0.5).shift(LEFT * 2)

        self.play(Create(sphere), Create(cube), Create(cone))
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(3)
        self.stop_ambient_camera_rotation()
```

### 3D 曲面绘图

```python
class ThreeDSurfaceDemo(ThreeDScene):
    def construct(self):
        axes = ThreeDAxes()
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        surface = Surface(
            lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
            u_range=[-PI, PI],
            v_range=[-PI, PI],
            fill_opacity=0.5,
        )
        surface.set_color_by_gradient(BLUE, GREEN, YELLOW)
        self.play(Create(surface))
        self.begin_ambient_camera_rotation(rate=0.1)
        self.wait(3)
```

### 3D 参数曲线

```python
class ThreeDParametricCurveDemo(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)
        curve = ParametricFunction(
            lambda t: np.array([np.cos(t), np.sin(t), t / 2]),
            t_range=[-2 * PI, 2 * PI],
            color=YELLOW,
        )
        self.play(Create(curve))
        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(3)
```

### Torus — 环面

```python
class TorusDemo(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)
        torus = Torus(R=1.5, r=0.5, color=BLUE, fill_opacity=0.5)
        self.play(Create(torus))
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(3)
```

### 固定在帧中的对象

```python
class FixedInFrameDemo(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)
        axes = ThreeDAxes()
        self.add(axes)

        text = Text("Fixed in Frame", font_size=36)
        self.add_fixed_in_frame_mobjects(text)
        text.to_corner(UL)

        sphere = Sphere(radius=1, color=BLUE, fill_opacity=0.5)
        self.play(Create(sphere))
        self.wait()
```

---

## 13. 特效与工具 (Special Effects)

### TracedPath — 轨迹追踪

```python
class TracedPathDemo(Scene):
    def construct(self):
        dot = Dot(color=YELLOW)
        path = TracedPath(dot.get_center, stroke_width=3, stroke_color=BLUE)
        self.add(dot, path)
        self.play(dot.animate.shift(RIGHT * 3 + UP * 2), run_time=2)
        self.play(dot.animate.shift(DOWN * 4), run_time=1)
        self.play(dot.animate.shift(LEFT * 3 + UP * 2), run_time=2)
        self.wait()
```

### GlowDot — 发光点

```python
class GlowDotDemo(Scene):
    def construct(self):
        glow = GlowDot(ORIGIN, color=RED, radius=0.5)
        self.add(glow)
        self.play(glow.animate.shift(RIGHT * 3), run_time=2)
        self.wait()
```

### Underline — 下划线

```python
class UnderlineDemo(Scene):
    def construct(self):
        text = Text("Underlined Text", font_size=48)
        underline = Underline(text, color=YELLOW)
        self.play(Write(text), Create(underline))
        self.wait()
```

### ImageMobject — 图像操作

```python
class ImageMobjectDemo(Scene):
    def construct(self):
        n = 256
        image_array = np.uint8(
            [[i * 256 / n for i in range(n)] for _ in range(n)]
        )
        image = ImageMobject(image_array).scale(2)
        bg = SurroundingRectangle(image, color=GREEN)
        self.add(image, bg)
        self.wait()
```

### Sound — 声音

```python
class SoundDemo(Scene):
    def construct(self):
        dot = Dot(color=YELLOW)
        self.add(dot)
        self.add_sound("click.wav")
        self.play(dot.animate.shift(RIGHT * 3))
        self.wait()
```

### always_redraw — 实时重绘

```python
class AlwaysRedrawDemo(Scene):
    def construct(self):
        tracker = ValueTracker(0)
        curve = always_redraw(
            lambda: ParametricFunction(
                lambda t: np.array([
                    t,
                    np.sin(t + tracker.get_value()),
                    0,
                ]),
                t_range=[-PI, PI],
                color=BLUE,
            )
        )
        self.add(curve)
        self.play(tracker.animate.set_value(TAU), run_time=4)
        self.wait()
```

### ValueTracker + Updater 完整模式

```python
class ValueTrackerUpdaterDemo(Scene):
    def construct(self):
        tracker = ValueTracker(0)

        dot = Dot(ORIGIN, color=YELLOW)
        dot.add_updater(lambda d: d.move_to(RIGHT * tracker.get_value()))

        label = MathTex(r"x = 0")
        label.add_updater(lambda m: m.become(
            MathTex(rf"x = {tracker.get_value():.1f}").next_to(dot, UP)
        ))

        line = always_redraw(
            lambda: Line(ORIGIN, dot.get_center(), color=BLUE)
        )

        self.add(dot, label, line)
        self.play(tracker.animate.set_value(5), run_time=3)
        self.play(tracker.animate.set_value(-3), run_time=2)
        self.wait()
```

### save_state / Restore — 状态保存恢复

```python
class SaveRestoreDemo(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5)
        square.save_state()
        self.add(square)

        self.play(square.animate.shift(RIGHT * 3).set_color(RED).scale(2))
        self.wait(0.5)
        self.play(Restore(square))
        self.wait()
```

---

## 14. 坐标系绘图 (Plotting)

### 完整函数绘图

```python
class FunctionPlotDemo(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-10, 10.3, 1],
            y_range=[-1.5, 1.5, 1],
            x_length=10,
            axis_config={"color": GREEN},
            x_axis_config={
                "numbers_to_include": np.arange(-10, 10.01, 2),
                "numbers_with_elongated_ticks": np.arange(-10, 10.01, 2),
            },
            tips=False,
        )
        axes_labels = axes.get_axis_labels()
        sin_graph = axes.plot(lambda x: np.sin(x), color=BLUE)
        cos_graph = axes.plot(lambda x: np.cos(x), color=RED)

        sin_label = axes.get_graph_label(
            sin_graph, "\\sin(x)", x_val=-10, direction=UP / 2
        )
        cos_label = axes.get_graph_label(cos_graph, label="\\cos(x)")

        vert_line = axes.get_vertical_line(
            axes.i2gp(TAU, cos_graph), color=YELLOW
        )
        line_label = axes.get_graph_label(
            cos_graph, r"x=2\pi", x_val=TAU, direction=UR, color=WHITE
        )

        plot = VGroup(axes, sin_graph, cos_graph, vert_line)
        labels = VGroup(axes_labels, sin_label, cos_label, line_label)
        self.add(plot, labels)
```

### ArgMin 动态追踪

```python
class ArgMinDemo(Scene):
    def construct(self):
        ax = Axes(
            x_range=[0, 10], y_range=[0, 100, 10],
            axis_config={"include_tip": False}
        )
        labels = ax.get_axis_labels(x_label="x", y_label="f(x)")

        t = ValueTracker(0)

        def func(x):
            return 2 * (x - 5) ** 2

        graph = ax.plot(func, color=MAROON)
        dot = Dot()
        dot.add_updater(lambda d: d.move_to(ax.c2p(t.get_value(), func(t.get_value()))))

        x_space = np.linspace(*ax.x_range[:2], 200)
        minimum_index = func(x_space).argmin()

        self.add(ax, labels, graph, dot)
        self.play(t.animate.set_value(x_space[minimum_index]))
        self.wait()
```

### Riemann 矩形与面积填充

```python
class RiemannAndAreaDemo(Scene):
    def construct(self):
        ax = Axes(
            x_range=[0, 5],
            y_range=[0, 6],
            x_axis_config={"numbers_to_include": [2, 3]},
            tips=False,
        )
        labels = ax.get_axis_labels()

        curve_1 = ax.plot(lambda x: 4 * x - x ** 2, x_range=[0, 4], color=BLUE_C)
        curve_2 = ax.plot(
            lambda x: 0.8 * x ** 2 - 3 * x + 4,
            x_range=[0, 4],
            color=GREEN_B,
        )

        riemann_area = ax.get_riemann_rectangles(
            curve_1, x_range=[0.3, 0.6], dx=0.03, color=BLUE, fill_opacity=0.5
        )
        area = ax.get_area(
            curve_2, [2, 3], bounded_graph=curve_1, color=GREY, opacity=0.5
        )

        self.add(ax, labels, curve_1, curve_2, riemann_area, area)
```

### 坐标轴上的多边形

```python
class PolygonOnAxesDemo(Scene):
    def construct(self):
        ax = Axes(
            x_range=[0, 10],
            y_range=[0, 10],
        )

        polygon = Polygon(
            ax.c2p(2, 2), ax.c2p(8, 2), ax.c2p(8, 6), ax.c2p(2, 6),
            color=BLUE, fill_opacity=0.3,
        )

        self.add(ax, polygon)
```

### 复平面

```python
class ComplexPlaneDemo(Scene):
    def construct(self):
        plane = ComplexPlane()
        plane.add_coordinates()

        dot = Dot(plane.n2p(2 + 3j), color=YELLOW)
        label = MathTex("2+3i").next_to(dot, UR, buff=0.1)

        self.add(plane, dot, label)
```

---

## 15. 布尔运算 (Boolean Operations)

### Intersection / Union / Exclusion / Difference

```python
class BooleanOpsDemo(Scene):
    def construct(self):
        ellipse1 = Ellipse(
            width=4.0, height=5.0, fill_opacity=0.5, color=BLUE, stroke_width=10
        ).move_to(LEFT)
        ellipse2 = ellipse1.copy().set_color(color=RED).move_to(RIGHT)
        bool_ops_text = MarkupText("<u>Boolean Operation</u>").next_to(ellipse1, UP * 3)
        ellipse_group = Group(bool_ops_text, ellipse1, ellipse2).move_to(LEFT * 3)
        self.play(FadeIn(ellipse_group))

        i = Intersection(ellipse1, ellipse2, color=GREEN, fill_opacity=0.5)
        self.play(i.animate.scale(0.25).move_to(RIGHT * 5 + UP * 2.5))
        intersection_text = Text("Intersection", font_size=23).next_to(i, UP)
        self.play(FadeIn(intersection_text))

        u = Union(ellipse1, ellipse2, color=ORANGE, fill_opacity=0.5)
        union_text = Text("Union", font_size=23)
        self.play(u.animate.scale(0.3).next_to(i, DOWN, buff=union_text.height * 3))
        union_text.next_to(u, UP)
        self.play(FadeIn(union_text))

        e = Exclusion(ellipse1, ellipse2, color=YELLOW, fill_opacity=0.5)
        exclusion_text = Text("Exclusion", font_size=23)
        self.play(e.animate.scale(0.3).next_to(u, DOWN, buff=exclusion_text.height * 3.5))
        exclusion_text.next_to(e, UP)
        self.play(FadeIn(exclusion_text))

        d = Difference(ellipse1, ellipse2, color=PINK, fill_opacity=0.5)
        difference_text = Text("Difference", font_size=23)
        self.play(d.animate.scale(0.3).next_to(u, LEFT, buff=difference_text.height * 3.5))
        difference_text.next_to(d, UP)
        self.play(FadeIn(difference_text))
```

---

## 16. 流线与向量场动画 (StreamLines & VectorField)

### StreamLines — 流线动画

```python
class StreamLinesDemo(Scene):
    def construct(self):
        func = lambda pos: np.sin(pos[0] / 2) * UR + np.cos(pos[1] / 2) * LEFT
        stream_lines = StreamLines(
            func,
            stroke_width=2,
            max_anchors_per_line=30,
        )
        self.add(stream_lines)
        stream_lines.start_animation(warm_up=False, flow_speed=1.5)
        self.wait(stream_lines.virtual_time / stream_lines.flow_speed)
```

### ArrowVectorField — 箭头向量场

```python
class VectorFieldDemo(Scene):
    def construct(self):
        func = lambda pos: np.array([np.sin(pos[1]), np.cos(pos[0]), 0])
        field = ArrowVectorField(func)
        self.play(Create(field), run_time=3)
        self.wait()
```

---

## 17. LaggedStart 延迟启动动画

### LaggedStart — 逐个延迟启动

```python
class LaggedStartDemo(Scene):
    def construct(self):
        squares = VGroup(*[Square(side_length=0.5).shift(i * RIGHT * 0.6) for i in range(10)])
        self.play(LaggedStart(*[FadeIn(s) for s in squares], lag_ratio=0.1))
        self.wait()
```

### LaggedStartMap — 批量延迟启动

```python
class LaggedStartMapDemo(Scene):
    def construct(self):
        dots = VGroup(*[Dot().shift(i * RIGHT * 0.5) for i in range(10)])
        self.play(LaggedStartMap(FadeIn, dots, lag_ratio=0.1))
        self.wait()
```

---

## 18. NumberPlane 非线性变换

### prepare_for_nonlinear_transform — 网格非线性变形

```python
class NonlinearTransform(Scene):
    def construct(self):
        grid = NumberPlane()
        grid_title = Tex("Non-linear Function", font_size=72)
        grid_title.move_to(UP * 3)

        self.add(grid, grid_title)
        self.play(
            FadeIn(grid_title, shift=UP),
            Create(grid, run_time=3, lag_ratio=0.1),
        )
        self.wait()

        grid.prepare_for_nonlinear_transform()
        self.play(
            grid.animate.apply_function(
                lambda p: p + np.array([np.sin(p[1]), np.sin(p[0]), 0])
            ),
            run_time=3,
        )
        self.wait()
```

---

## 19. ApplyPointwiseFunction 复数变换

### WarpSquare — 复数指数映射

```python
class WarpSquare(Scene):
    def construct(self):
        square = Square()
        self.play(
            ApplyPointwiseFunction(
                lambda point: complex_to_R3(np.exp(R3_to_complex(point))),
                square,
            ),
        )
        self.wait()
```

---

## 20. 完整教学案例

### 勾股定理动画

```python
class PythagoreanTheorem(Scene):
    def construct(self):
        title = Text("勾股定理", font_size=60, color=YELLOW)
        subtitle = Text("a² + b² = c²", font_size=40, color=WHITE)
        subtitle.next_to(title, DOWN)
        self.play(Write(title), run_time=1.5)
        self.play(FadeIn(subtitle))
        self.wait(1)
        self.play(FadeOut(title), FadeOut(subtitle))

        A = np.array([0, 0, 0])
        B = np.array([3, 0, 0])
        C = np.array([0, 2, 0])
        triangle = Polygon(A, B, C, color=WHITE)
        right_angle = RightAngle(Line(A, B), Line(A, C), length=0.2, color=WHITE)

        label_a = MathTex("a", color=RED).next_to(Line(A, C).get_center(), LEFT)
        label_b = MathTex("b", color=GREEN).next_to(Line(A, B).get_center(), DOWN)
        label_c = MathTex("c", color=BLUE).next_to(Line(B, C).get_center(), RIGHT * 0.5 + UP * 0.3)

        self.play(Create(triangle), Create(right_angle))
        self.play(Write(label_a), Write(label_b), Write(label_c))
        self.wait(1)

        sq_a = Square(side_length=2, color=RED, fill_opacity=0.3)
        sq_a.next_to(Line(A, C), LEFT, buff=0)
        sq_b = Square(side_length=3, color=GREEN, fill_opacity=0.3)
        sq_b.next_to(Line(A, B), DOWN, buff=0)

        self.play(GrowFromEdge(sq_a, RIGHT), GrowFromEdge(sq_b, UP), run_time=1.5)
        self.wait(0.5)

        formula = MathTex(r"a^2", "+", r"b^2", "=", r"c^2", font_size=60)
        formula[0].set_color(RED)
        formula[2].set_color(GREEN)
        formula[4].set_color(BLUE)
        formula.to_corner(UR)
        self.play(Write(formula))
        self.wait(2)

        self.play(
            FadeOut(triangle), FadeOut(right_angle),
            FadeOut(label_a), FadeOut(label_b), FadeOut(label_c),
            FadeOut(sq_a), FadeOut(sq_b), FadeOut(formula),
        )
```

### OpeningManim — 完整开场动画

```python
class OpeningManim(Scene):
    def construct(self):
        title = Tex(r"This is some \LaTeX")
        basel = MathTex(r"\sum_{n=1}^\infty \frac{1}{n^2} = \frac{\pi^2}{6}")
        VGroup(title, basel).arrange(DOWN)
        self.play(Write(title), FadeIn(basel, shift=DOWN))
        self.wait()

        transform_title = Tex("That was a transform")
        transform_title.to_corner(UP + LEFT)
        self.play(
            Transform(title, transform_title),
            LaggedStart(*(FadeOut(obj, shift=DOWN) for obj in basel)),
        )
        self.wait()

        grid = NumberPlane()
        grid_title = Tex("This is a grid", font_size=72)
        grid_title.move_to(transform_title)
        self.add(grid, grid_title)
        self.play(
            FadeOut(title),
            FadeIn(grid_title, shift=UP),
            Create(grid, run_time=3, lag_ratio=0.1),
        )
        self.wait()

        grid_transform_title = Tex(r"That was a non-linear function \\ applied to the grid")
        grid_transform_title.move_to(grid_title, UL)
        grid.prepare_for_nonlinear_transform()
        self.play(
            grid.animate.apply_function(
                lambda p: p + np.array([np.sin(p[1]), np.sin(p[0]), 0])
            ),
            run_time=3,
        )
        self.wait()
        self.play(Transform(grid_title, grid_transform_title))
        self.wait()
```

### 函数图像动态追踪

```python
class FunctionPlotWithTracker(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            x_length=10,
            y_length=6,
            axis_config={"color": GREY},
            tips=True,
        )
        axes_labels = axes.get_axis_labels(x_label="x", y_label="f(x)")
        self.play(Create(axes), Write(axes_labels))

        sin_graph = axes.plot(lambda x: np.sin(x), color=BLUE, x_range=[-3, 3])
        sin_label = axes.get_graph_label(sin_graph, label="\\sin(x)", x_val=2, direction=UP)
        self.play(Create(sin_graph), Write(sin_label))
        self.wait(0.5)

        cos_graph = axes.plot(lambda x: np.cos(x), color=RED, x_range=[-3, 3])
        cos_label = axes.get_graph_label(cos_graph, label="\\cos(x)", x_val=1, direction=DOWN)
        self.play(Create(cos_graph), Write(cos_label))
        self.wait(1)

        tracker = ValueTracker(-3)
        dot = always_redraw(
            lambda: Dot(
                axes.c2p(tracker.get_value(), np.sin(tracker.get_value())),
                color=YELLOW,
            )
        )
        self.play(Create(dot))
        self.play(tracker.animate.set_value(3), run_time=4)
        self.wait(1)

        area = axes.get_area(sin_graph, x_range=[0, PI], color=[BLUE, GREEN], opacity=0.4)
        area_label = MathTex(r"\int_0^\pi \sin(x)\,dx = 2")
        area_label.to_corner(UR)
        self.play(Create(area), Write(area_label))
        self.wait(2)
```

---

## 21. 交互模式与调试

### self.embed() — 交互式调试

```python
class InteractiveDemo(Scene):
    def construct(self):
        circle = Circle(color=BLUE)
        self.play(Create(circle))
        self.embed()
```

在交互终端中可实时测试：

```python
>>> play(circle.animate.stretch(4, dim=0))
>>> play(Rotate(circle, 90 * DEGREES))
>>> play(circle.animate.set_color(RED))
>>> circle.get_center()
>>> exit()
```

### save_state / Restore — 状态回溯

```python
class SaveRestoreDemo(Scene):
    def construct(self):
        square = Square(color=BLUE, fill_opacity=0.5)
        square.save_state()
        self.add(square)
        self.play(square.animate.shift(RIGHT * 3).set_color(RED).scale(2))
        self.wait(0.5)
        self.play(Restore(square))
        self.wait()
```

---

## 22. 中文字体处理

### 查看可用字体

```python
import manimpango
print(manimpango.list_fonts())
```

### 指定中文字体

```python
class ChineseTextDemo(Scene):
    def construct(self):
        t1 = Text("数学之美", font="Noto Sans CJK SC", font_size=60)
        t2 = Text("你好世界", font="Source Han Sans", font_size=48)
        t3 = Text("勾股定理", font="Microsoft YaHei", font_size=48)
        group = VGroup(t1, t2, t3).arrange(DOWN, buff=0.8)
        self.play(Write(group))
        self.wait()
```

### 中文 + 数学公式混排

```python
class ChineseMathDemo(Scene):
    def construct(self):
        title = Text("勾股定理", font="Noto Sans CJK SC", font_size=48, color=YELLOW)
        formula = MathTex(r"a^2 + b^2 = c^2", font_size=48)
        formula.next_to(title, DOWN, buff=0.5)
        self.play(Write(title))
        self.play(Write(formula))
        self.wait()
```

---

## 23. 配置系统

### 代码内配置

```python
from manim import *

config.background_color = "#1a1a2e"
config.frame_rate = 60
config.pixel_height = 1080
config.pixel_width = 1920

class ConfigDemo(Scene):
    def construct(self):
        self.camera.background_color = WHITE
        circle = Circle(color=BLUE)
        self.play(Create(circle))
        self.wait()
```

### manim.cfg 项目级配置

```ini
# manim.cfg（放在项目根目录）
[CLI]
output_file = my_animation
media_dir = ./output

[renderer]
background_color = #1a1a2e
frame_rate = 60
pixel_height = 1080
pixel_width = 1920
```

### 3b1b 暗黑主题配色

```python
config.background_color = "#1C1C1C"

MANIM_BLUE = "#58C4DD"
MANIM_GREEN = "#83C167"
MANIM_RED = "#FC6255"
MANIM_YELLOW = "#FFFF00"
MANIM_WHITE = "#FFFFFF"
MANIM_GREY = "#888888"
```

---

## 24. 项目初始化命令

```bash
# 使用 manim init 创建项目（v0.19.0+）
manim init project my-project --default

# 使用 uv 创建项目（官方推荐）
uv init my-animations
cd my-animations
uv add manim
uv run manim --version
```

---

## 25. 微积分教学动画

### 导数与切线可视化

```python
class DerivativeVisualization(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-1, 3, 1],
            x_length=10,
            y_length=6,
        )
        labels = axes.get_axis_labels("x", "y")

        func = axes.plot(lambda x: 0.5 * x ** 2, color=BLUE)
        func_label = axes.get_graph_label(func, r"y = \frac{1}{2}x^2", x_val=2, direction=UP)

        derivative = axes.plot(lambda x: x, color=RED)
        deriv_label = axes.get_graph_label(derivative, r"y' = x", x_val=-2, direction=UP)

        self.play(Create(axes), Write(labels))
        self.play(Create(func), Write(func_label))
        self.wait()

        x_val = 1.5
        point = Dot(axes.c2p(x_val, 0.5 * x_val ** 2), color=YELLOW)
        secant_group = axes.get_secant_slope_group(
            x_val, func, dx=0.01, secant_line_color=GREEN
        )
        self.play(Create(point), Create(secant_group))
        self.wait()

        self.play(Create(derivative), Write(deriv_label))
        self.wait()

        area = axes.get_area(func, x_range=(-2, 2), color=BLUE, opacity=0.3)
        area_label = MathTex(r"\int_{-2}^{2} \frac{1}{2}x^2\,dx = \frac{4}{3}")
        area_label.to_corner(UR)
        self.play(FadeIn(area), Write(area_label))
        self.wait(2)
```

### Riemann 和到定积分的过渡

```python
class RiemannToIntegral(Scene):
    def construct(self):
        axes = Axes(x_range=[0, 5], y_range=[0, 6], tips=False)
        labels = axes.get_axis_labels("x", "f(x)")
        func = axes.plot(lambda x: 4 * x - x ** 2, x_range=[0, 4], color=BLUE)

        self.play(Create(axes), Write(labels), Create(func))
        self.wait()

        for n_rects in [5, 10, 20, 50]:
            riemann = axes.get_riemann_rectangles(
                func, x_range=[0.5, 3.5], dx=3.0 / n_rects, color=GREEN, fill_opacity=0.5
            )
            self.play(Create(riemann), run_time=0.8)
            self.wait(0.3)
            self.play(FadeOut(riemann), run_time=0.3)

        area = axes.get_area(func, [0.5, 3.5], color=BLUE, opacity=0.4)
        integral_label = MathTex(r"\int_{0.5}^{3.5} f(x)\,dx")
        integral_label.to_corner(UR)
        self.play(FadeIn(area), Write(integral_label))
        self.wait(2)
```

---

## 26. 傅里叶级数可视化

### 逐项叠加傅里叶近似

```python
class FourierSeriesApprox(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-PI, PI, PI / 2],
            y_range=[-1.5, 1.5, 0.5],
            x_length=10,
            y_length=5,
        )
        labels = axes.get_axis_labels("x", "y")

        original = axes.plot(lambda x: np.sign(np.sin(x)), color=WHITE, x_range=[-PI, PI])
        self.play(Create(axes), Write(labels))
        self.play(Create(original), run_time=2)
        self.wait()

        colors = [BLUE, GREEN, RED, YELLOW, PURPLE, ORANGE, TEAL, PINK]
        n_terms = 8

        for n in range(1, n_terms + 1):
            def fourier_approx(x, terms=n):
                result = 0
                for k in range(1, terms + 1):
                    result += (4 / (k * PI)) * np.sin(k * x) if k % 2 == 1 else 0
                return result

            approx = axes.plot(fourier_approx, color=colors[(n - 1) % len(colors)], x_range=[-PI, PI])
            label = MathTex(rf"n = {n}", font_size=30).to_corner(UR)
            self.play(Create(approx), Write(label), run_time=1)
            self.wait(0.5)
            if n < n_terms:
                self.play(FadeOut(approx), FadeOut(label), run_time=0.3)

        self.wait(2)
```

---

## 27. 神经网络可视化

### 基础神经网络结构

```python
class BasicNeuralNetwork(Scene):
    def construct(self):
        input_nodes = VGroup(*[Circle(radius=0.2, color=BLUE, fill_opacity=0.5) for _ in range(3)])
        input_nodes.arrange(DOWN, buff=0.5)

        hidden_nodes = VGroup(*[Circle(radius=0.2, color=GREEN, fill_opacity=0.5) for _ in range(4)])
        hidden_nodes.arrange(DOWN, buff=0.5)
        hidden_nodes.next_to(input_nodes, RIGHT, buff=1.5)

        output_nodes = VGroup(*[Circle(radius=0.2, color=RED, fill_opacity=0.5) for _ in range(2)])
        output_nodes.arrange(DOWN, buff=0.5)
        output_nodes.next_to(hidden_nodes, RIGHT, buff=1.5)

        connections = VGroup()
        for src in input_nodes:
            for dst in hidden_nodes:
                connections.add(Line(src.get_center(), dst.get_center(), stroke_width=1, color=GREY))
        for src in hidden_nodes:
            for dst in output_nodes:
                connections.add(Line(src.get_center(), dst.get_center(), stroke_width=1, color=GREY))

        labels = VGroup(
            Text("输入层", font_size=20).next_to(input_nodes, DOWN),
            Text("隐藏层", font_size=20).next_to(hidden_nodes, DOWN),
            Text("输出层", font_size=20).next_to(output_nodes, DOWN),
        )

        self.play(Create(input_nodes), Create(labels[0]))
        self.play(Create(connections))
        self.play(Create(hidden_nodes), Create(labels[1]))
        self.play(Create(output_nodes), Create(labels[2]))
        self.wait()
```

### 使用 Graph partite 布局创建神经网络

```python
class NeuralNetworkGraph(Scene):
    def construct(self):
        vertices = [
            "I1", "I2", "I3",
            "H1", "H2", "H3", "H4",
            "O1", "O2",
        ]
        edges = [
            ("I1", "H1"), ("I1", "H2"), ("I1", "H3"), ("I1", "H4"),
            ("I2", "H1"), ("I2", "H2"), ("I2", "H3"), ("I2", "H4"),
            ("I3", "H1"), ("I3", "H2"), ("I3", "H3"), ("I3", "H4"),
            ("H1", "O1"), ("H1", "O2"),
            ("H2", "O1"), ("H2", "O2"),
            ("H3", "O1"), ("H3", "O2"),
            ("H4", "O1"), ("H4", "O2"),
        ]
        graph = Graph(
            vertices, edges,
            layout="partite",
            layout_config={
                "partitions": [
                    ["I1", "I2", "I3"],
                    ["H1", "H2", "H3", "H4"],
                    ["O1", "O2"],
                ]
            },
            labels=True,
            vertex_config={
                **{f"I{i}": {"fill_color": BLUE} for i in range(1, 4)},
                **{f"H{i}": {"fill_color": GREEN} for i in range(1, 5)},
                **{f"O{i}": {"fill_color": RED} for i in range(1, 3)},
            },
        )
        self.play(Create(graph))
        self.wait()
```

---

## 28. 梯度下降动画

### 2D 梯度下降

```python
class GradientDescent2D(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 5, 1],
            x_length=10,
            y_length=6,
        )
        func = lambda x: x ** 2
        curve = axes.plot(func, color=BLUE)
        labels = axes.get_axis_labels("x", "f(x)")

        self.play(Create(axes), Write(labels), Create(curve))

        x_val = ValueTracker(2.5)
        dot = always_redraw(
            lambda: Dot(axes.c2p(x_val.get_value(), func(x_val.get_value())), color=YELLOW)
        )
        tangent = always_redraw(
            lambda: axes.get_secant_slope_group(
                x_val.get_value(), curve, dx=0.01, secant_line_color=GREEN
            )
        )
        self.add(dot, tangent)

        lr = 0.3
        for _ in range(8):
            new_x = x_val.get_value() - lr * 2 * x_val.get_value()
            self.play(x_val.animate.set_value(new_x), run_time=0.8)

        self.wait()
```

---

## 29. 函数变换动画

### sin(x) → 2sin(2x) 变换过程

```python
class FunctionTransformation(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            x_length=10,
            y_length=6,
        )
        labels = axes.get_axis_labels("x", "f(x)")

        sin_graph = axes.plot(lambda x: np.sin(x), color=BLUE)
        sin_label = axes.get_graph_label(sin_graph, r"\sin(x)", x_val=2, direction=UP)

        self.play(Create(axes), Write(labels))
        self.play(Create(sin_graph), Write(sin_label))
        self.wait()

        transform_text = Text("振幅加倍，周期减半", font_size=30, font="Noto Sans CJK SC")
        transform_text.to_edge(UP)
        self.play(Write(transform_text))

        transformed = axes.plot(lambda x: 2 * np.sin(2 * x), color=GREEN)
        transformed_label = axes.get_graph_label(transformed, r"2\sin(2x)", x_val=1, direction=UP)

        self.play(
            Transform(sin_graph, transformed),
            ReplacementTransform(sin_label, transformed_label),
            run_time=3,
        )
        self.wait(2)
```

---

## 30. Matrix 高级用法

### 矩阵样式与着色

```python
class MatrixAdvancedDemo(Scene):
    def construct(self):
        m0 = Matrix([[2, r"\pi"], [-1, 1]])

        m1 = Matrix(
            [[2, 0, 4], [-1, 1, 5]],
            v_buff=1.3, h_buff=0.8,
            left_bracket=r"\{", right_bracket=r"\}",
        )
        m1.add(SurroundingRectangle(m1.get_columns()[1]))

        m2 = Matrix(
            [[2, 1], [-1, 3]],
            left_bracket="(", right_bracket=")",
        )

        m3 = Matrix(
            [[2, 1], [-1, 3]],
            left_bracket=r"\langle", right_bracket=r"\rangle",
        )

        m4 = Matrix([[2, 1], [-1, 3]]).set_column_colors(RED, GREEN)
        m5 = Matrix([[2, 1], [-1, 3]]).set_row_colors(RED, GREEN)

        g = Group(m0, m1, m2, m3, m4, m5).arrange_in_grid(buff=2)
        self.add(g)
```

---

## 31. AnimationGroup 动画组合

### 同时动画与延迟动画

```python
class AnimationGroupDemo(Scene):
    def construct(self):
        shapes = VGroup(
            Circle(radius=0.5, color=RED),
            Square(side_length=1, color=BLUE),
            Triangle(color=GREEN),
        ).arrange(RIGHT, buff=1)

        self.play(LaggedStart(
            *[Create(shape) for shape in shapes],
            lag_ratio=0.5,
        ))

        self.play(AnimationGroup(
            shapes[0].animate.shift(UP),
            shapes[1].animate.scale(1.5),
            shapes[2].animate.rotate(PI / 2),
            lag_ratio=0.8,
        ))

        self.play(AnimationGroup(
            *[FadeOut(shape, shift=DOWN) for shape in shapes],
            lag_ratio=0.3,
        ))
        self.wait()
```

---

## 32. apply_complex_function 复数函数变换

### 指数映射变换网格

```python
class ComplexFunctionDemo(Scene):
    def construct(self):
        grid = Tex(r"\pi").get_grid(10, 10, height=4)
        self.add(grid)

        self.play(grid.animate.shift(LEFT))
        self.play(grid.animate.set_color(YELLOW))
        self.wait()

        self.play(
            grid.animate.apply_complex_function(np.exp),
            run_time=5,
        )
        self.wait()

        self.play(
            grid.animate.apply_function(
                lambda p: [
                    p[0] + 0.5 * np.sin(p[1]),
                    p[1] + 0.5 * np.sin(p[0]),
                    p[2],
                ]
            ),
            run_time=5,
        )
        self.wait()
```

---

## 附录：动画选择决策树

```
需要什么效果？
├── 对象出现
│   ├── 绘制轮廓 → Create / ShowCreation
│   ├── 书写文字 → Write
│   ├── 先边框后填充 → DrawBorderThenFill
│   ├── 淡入 → FadeIn (带 shift/scale 参数)
│   ├── 从中心/点/边缘生长 → GrowFromCenter/Point/Edge
│   ├── 箭头生长 → GrowArrow
│   ├── 旋转出现 → SpinInFromNothing
│   ├── 螺旋进入 → SpiralIn
│   └── 逐字显示 → AddTextLetterByLetter
├── 对象消失
│   ├── 淡出 → FadeOut (带 shift 参数)
│   ├── 反向书写 → Unwrite
│   ├── 缩到中心 → ShrinkToCenter
│   └── 逐字移除 → RemoveTextLetterByLetter
├── 对象变换
│   ├── 形状变换 → Transform / ReplacementTransform
│   ├── 概念联系 → ReplacementTransform (3b1b核心)
│   ├── 公式变换 → TransformMatchingTex
│   ├── 形状匹配 → TransformMatchingShapes
│   ├── 淡入变换 → FadeTransform
│   ├── 顺/逆时针 → ClockwiseTransform / CounterclockwiseTransform
│   ├── 循环替换 → CyclicReplace
│   └── 交换 → Swap
├── 强调/指示
│   ├── 闪烁指示 → Indicate
│   ├── 聚焦 → FocusOn
│   ├── 闪光 → Flash
│   ├── 波浪 → ApplyWave
│   ├── 摇晃 → Wiggle
│   ├── 环绕框 → Circumscribe
│   ├── 闪光环绕 → ShowPassingFlashAround
│   └── 包围矩形 → SurroundingRectangle
├── 移动/旋转
│   ├── 沿路径移动 → MoveAlongPath
│   ├── 移到目标 → MoveToTarget
│   ├── 旋转 → Rotate / Rotating
│   └── 相位流 → PhaseFlow
├── 动态更新
│   ├── 值追踪 → ValueTracker + animate
│   ├── 实时重绘 → always_redraw
│   ├── 更新器 → add_updater / remove_updater
│   └── 轨迹追踪 → TracedPath
└── 相机控制
    ├── 移动相机 → MovingCameraScene + self.camera.frame.animate
    ├── 缩放 → self.camera.frame.animate.set_width()
    └── 3D旋转 → ThreeDScene + begin_ambient_camera_rotation()
```
