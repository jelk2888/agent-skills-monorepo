# Manim API 速查（3b1b风格增强版 + 官方示例补充 + 社区教程整合）

## 目录
1. [3b1b风格常量](#3b1b风格常量)
2. [场景类](#场景类)
3. [Mobject 体系](#mobject-体系)
4. [动画体系](#动画体系)
5. [坐标系与绘图](#坐标系与绘图)
6. [文本与公式](#文本与公式)
7. [颜色与样式](#颜色与样式)
8. [缓动函数](#缓动函数)
9. [常用常量](#常用常量)
10. [3D 相关](#3d-相关)
11. [高级动画模式](#高级动画模式)
12. [布尔运算](#布尔运算)
13. [标注与装饰](#标注与装饰)
14. [图论](#图论)
15. [表格](#表格)
16. [版本差异](#版本差异)
17. [常见陷阱](#常见陷阱)
18. [交互模式](#交互模式)
19. [配置系统](#配置系统)
20. [中文字体](#中文字体)
21. [项目初始化](#项目初始化)
22. [图片讲解视频工具](#图片讲解视频工具)
23. [研究员模式工具](#研究员模式工具)

> **完整动画示例代码**见 `references/examples_reference.md`，包含 150+ 官方示例及社区精选案例的分类代码。

---

## 3b1b风格常量

### Colors3B1B 语义色彩系统

```python
class Colors3B1B:
    """3b1b标准配色方案 — 同一概念全视频同色！"""

    # === 概念语义色 ===
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

    # === 临时色 ===
    TEMP_A = GREEN_C
    TEMP_B = ORANGE
    TEMP_C = MAROON_C
```

**配色铁律**:
1. 同一概念整个系列永远同色（最重要！）
2. 单帧画面 ≤ 4-5种颜色
3. 始终使用 `_C` 后缀的颜色常量（`BLUE_C` 非 `BLUE`）
4. 暖冷对比: 冷色(蓝)=输入 → 暖色(红/橙/黄)=输出

### Timing 时序参数

```python
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
    NEW_INFO_INTERVAL = 4.0
```

### 质量检核清单

#### 技术层面
- [ ] 所有Scene可正常渲染无报错
- [ ] 色彩在全视频中保持一致
- [ ] 无闪烁/撕裂/错位/重叠

#### 设计层面（3b1b风味检测）
- [ ] 单帧信息密度 ≤ 5个活跃元素
- [ ] 每个动画运动都有明确的教学目的
- [ ] 节奏自然（有呼吸感，有停顿）
- [ ] 颜色编码全局一致且符合语义
- [ ] 深色背景（不是白色！）

#### 教学层面
- [ ] 前5秒内抓住注意力
- [ ] 遵循 直觉→形式化 的顺序
- [ ] 结尾回扣开头的问题

---

## 场景类

| 类名 | 用途 |
|------|------|
| `Scene` | 基础 2D 场景 |
| `ThreeDScene` | 3D 场景 |
| `MovingCameraScene` | 可移动相机场景 |
| `ZoomedScene` | 缩放场景 |
| `VectorScene` | 向量场景 |
| `LinearTransformationScene` | 线性变换场景 |

### Scene 核心方法

```python
self.add(*mobjects)           # 添加对象到场景
self.remove(*mobjects)        # 从场景移除对象
self.play(*animations, **kw)  # 播放动画
self.wait(duration=1)         # 等待
self.clear()                  # 清空场景
self.bring_to_front(*mobs)    # 置前
self.bring_to_back(*mobs)     # 置后
self.add_sound("file.wav")    # 添加声音
```

### MovingCameraScene 相机控制

```python
class MyScene(MovingCameraScene):
    def construct(self):
        self.camera.frame.animate.move_to(target)
        self.camera.frame.animate.set_width(width)
        self.camera.frame.animate.set_height(height)
```

### ThreeDScene 相机控制

```python
class MyScene(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75*DEGREES, theta=-45*DEGREES)
        self.begin_ambient_camera_rotation(rate=0.2)
        self.stop_ambient_camera_rotation()
        self.move_camera(phi=..., theta=..., frame_center=...)
        self.add_fixed_orientation_mobjects(*mobs)
        self.add_fixed_in_frame_mobjects(*mobs)
```
```

### play() 关键参数

```python
self.play(
    animation,
    run_time=1,          # 持续时间（秒）
    rate_func=smooth,    # 缓动函数
    lag_ratio=0,         # 子动画延迟比例
    remover=False,       # 结束后移除
)
```

---

## Mobject 体系

### 基础类

| 类 | 说明 |
|----|------|
| `Mobject` | 根基类 |
| `VMobject` | 向量化对象（贝塞尔曲线） |
| `VGroup` | VMobject 容器 |
| `Group` | Mobject 容器 |
| `ValueTracker` | 值追踪器（不可见） |

### 几何图形

| 类 | 关键参数 |
|----|---------|
| `Circle(radius=1)` | `radius` |
| `Square(side_length=2)` | `side_length` |
| `Rectangle(width=4, height=2)` | `width`, `height` |
| `RoundedRectangle(width, height, corner_radius)` | `corner_radius` |
| `Polygon(*vertices)` | 顶点列表 |
| `RegularPolygon(n=6)` | `n` 边数 |
| `ArcPolygon(*arcs)` | 弧形多边形 |
| `Trapezoid(height, width_top, width_bottom)` | 梯形 |
| `Line(start, end)` | 起点、终点 |
| `DashedLine(start, end, dash_length)` | 虚线 |
| `Arrow(start, end)` | 带箭头线段 |
| `DoubleArrow(start, end)` | 双箭头线段 |
| `Arc(radius=1, start_angle=0, angle=PI/2)` | 弧线 |
| `ArcBetweenPoints(start, end, angle)` | 两点间弧线 |
| `Dot(point=ORIGIN)` | 点 |
| `SmallDot(point=ORIGIN)` | 小点 |
| `GlowDot(point, color, radius)` | 发光点 |
| `Cross(stroke_width=6)` | 叉号 |
| `Annulus(inner_radius=1, outer_radius=2)` | 环形 |
| `AnnularSector(inner_radius, outer_radius, angle)` | 环形扇区 |
| `Sector(outer_radius, angle)` | 扇区 |
| `Cutout(*mobjects)` | 镂空 |
| `Triangle()` | 三角形 |
| `Star(n=5, outer_radius=1, inner_radius=0.5)` | 星形 |
| `Ellipse(width=2, height=1)` | 椭圆 |
| `Underline(mobject, color)` | 下划线 |

### 坐标系

| 类 | 说明 |
|----|------|
| `Axes(x_range, y_range)` | 通用坐标轴 |
| `NumberPlane()` | 带网格的坐标平面 |
| `PolarPlane()` | 极坐标平面 |
| `ThreeDAxes()` | 3D 坐标轴 |
| `NumberLine()` | 数轴 |
| `ComplexPlane()` | 复平面 |

### 图论

```python
g = Graph(
    vertices=[1, 2, 3, 4],
    edges=[(1, 2), (2, 3), (3, 4), (4, 1)],
    layout="circular",
    labels=True,
    edge_type=Arrow,
    edge_config={"tip_length": 0.15},
)
```

| 布局选项 | 说明 |
|---------|------|
| `"circular"` | 圆形布局 |
| `"spring"` | 弹簧布局 |
| `"tree"` | 树形布局（需 `root_vertex`） |
| `"partite"` | 分区布局（需 `partitions`） |
| 自定义 dict | `{vertex: np.array([x, y, 0])}` |

```python
g.vertices[1].set_color(RED)
g.edges[(1, 2)].set_color(YELLOW)
self.play(g.vertices[1].animate.move_to(UP * 2))
```

### 表格

```python
table = Table(
    [["1", "2"], ["3", "4"]],
    row_labels=[Text("R1"), Text("R2")],
    col_labels=[Text("C1"), Text("C2")],
)
table.get_entries().set_color(BLUE)
table.get_entries((1, 1)).set_color(RED)
```

| 类 | 说明 |
|----|------|
| `Table(data, row_labels, col_labels)` | 基本表格 |
| `MathTable(data)` | 数学表格 |
| `MobjectTable(data)` | Mobject 表格 |

### 3D 对象

| 类 | 说明 |
|----|------|
| `Sphere(radius=1)` | 球体 |
| `Cube(side_length=2)` | 立方体 |
| `Cylinder(radius=1, height=2)` | 圆柱 |
| `Cone(base_radius=1, height=2)` | 圆锥 |
| `Torus(R=1.5, r=0.5)` | 环面 |
| `Surface(func, u_range, v_range)` | 参数曲面 |
| `Dot3D(point)` | 3D 点 |
| `Arrow3D(start, end)` | 3D 箭头 |
| `Line3D(start, end)` | 3D 线段 |

### Mobject 变换方法

```python
mob.move_to(target)                    # 移动到目标
mob.shift(vector)                      # 平移
mob.rotate(angle, about_point=ORIGIN)  # 旋转
mob.scale(factor, about_point=ORIGIN)  # 缩放
mob.flip(axis=UP)                      # 翻转
mob.set_color(color)                   # 设置颜色
mob.set_opacity(opacity)               # 设置透明度
mob.set_fill(color, opacity)           # 设置填充
mob.set_stroke(color, width, opacity)  # 设置描边
mob.next_to(target, direction, buff)   # 放在目标旁边
mob.align_to(target, direction)        # 对齐
mob.get_center()                       # 获取中心
mob.get_top/bottom/left/right()        # 获取边界
mob.copy()                             # 深拷贝
mob.become(other)                      # 变为另一个对象
mob.save_state()                       # 保存状态
mob.restore()                          # 恢复状态
mob.surround(other)                    # 包围另一个对象
mob.generate_target()                  # 生成目标状态
```

### VGroup 操作

```python
group = VGroup(mob1, mob2, mob3)
group.arrange(RIGHT, buff=0.5)        # 水平排列
group.arrange(DOWN, buff=0.5)         # 垂直排列
group.arrange_in_grid(rows, cols)     # 网格排列
```

### Updater 机制

```python
# 方式 1: add_updater
mob.add_updater(lambda m: m.move_to(dot.get_center()))

# 方式 2: add_updater with dt (时间参数)
mob.add_updater(lambda m, dt: m.rotate(dt * PI))

# 方式 3: always_redraw (社区版)
mob = always_redraw(lambda: Circle(radius=tracker.get_value()))

# 方式 4: f_always (社区版)
f_always(mob.set_width, tracker.get_value)

# 移除 updater
mob.remove_updater(func)
mob.clear_updaters()
mob.suspend_updating()
mob.resume_updating()
```

---

## 动画体系

### 创建/消失

| 动画 | 说明 |
|------|------|
| `Create(mob)` | 创建（绘制轮廓） |
| `Write(mob)` | 书写效果 |
| `Unwrite(mob)` | 反向书写效果 |
| `DrawBorderThenFill(mob)` | 先轮廓后填充 |
| `ShowPassingFlash(mob, time_width)` | 闪光通过效果 |
| `ShowCreationThenDestruction(mob)` | 创建后销毁 |
| `ShowCreationThenFadeOut(mob)` | 创建后淡出 |
| `SpiralIn(mob, scale_factor)` | 螺旋进入 |
| `FadeIn(mob, shift=..., scale=...)` | 淡入（可带方向和缩放） |
| `FadeInFromPoint(mob, point)` | 从指定点淡入 |
| `FadeInFromLarge(mob, scale_factor)` | 从大缩小淡入 |
| `FadeOut(mob)` | 淡出 |
| `FadeOutAndShift(mob, direction)` | 淡出并位移 |
| `FadeOutToPoint(mob, point)` | 淡出到指定点 |
| `GrowFromCenter(mob)` | 从中心生长 |
| `GrowFromPoint(mob, point)` | 从点生长 |
| `GrowFromEdge(mob, edge)` | 从边缘生长 |
| `GrowArrow(arrow)` | 箭头生长 |
| `SpinInFromNothing(mob)` | 旋转出现 |
| `ShowIncreasingSubsets(mob)` | 逐个显示子对象 |
| `AddTextLetterByLetter(text, time_per_char)` | 逐字显示文字 |
| `RemoveTextLetterByLetter(text, time_per_char)` | 逐字移除文字 |
| `Uncreate(mob)` | 反向创建（消失） |
| `ShrinkToCenter(mob)` | 缩到中心 |

### 变换

| 动画 | 说明 |
|------|------|
| `Transform(source, target)` | 形状变换（源变量仍引用原对象） |
| `ReplacementTransform(src, tgt)` | 替换变换（源被移除，目标加入场景） |
| `TransformFromCopy(src, tgt)` | 从副本变换（保留源） |
| `TransformMatchingShapes(src, tgt)` | 智能匹配形状变换 |
| `TransformMatchingTex(src, tgt)` | 按 TeX 字符串匹配变换 |
| `ClockwiseTransform(src, tgt)` | 顺时针变换 |
| `CounterclockwiseTransform(src, tgt)` | 逆时针变换 |
| `CyclicReplace(*mobs)` | 循环替换 |
| `Swap(mob1, mob2)` | 交换两个对象 |
| `FadeTransform(src, tgt)` | 淡入变换 |
| `FadeTransformPieces(src, tgt)` | 分片淡入变换 |
| `ApplyMethod(method, *args)` | 应用方法动画 |
| `ApplyPointwiseFunction(func, mob)` | 逐点函数应用 |
| `FadeToColor(mob, color)` | 渐变到颜色 |
| `ScaleInPlace(mob, factor)` | 原地缩放 |

### Transform vs ReplacementTransform

```python
# Transform - 源变量改变外观但仍引用原对象
self.play(Transform(A, B))
# A 仍在场景中（但看起来像 B），B 不在场景中

# ReplacementTransform - 源被替换为目标
self.play(ReplacementTransform(A, B))
# A 从场景中移除，B 加入场景
```

### 带路径弧的变换

```python
# 沿弧线变换
self.play(Transform(dot1, dot2, path_arc=PI / 2))
```

### MoveToTarget 模式

```python
square = Square()
self.add(square)
square.generate_target()
square.target.shift(RIGHT * 2).set_color(RED).scale(2)
self.play(MoveToTarget(square))
```

### 指示/强调

| 动画 | 说明 |
|------|------|
| `Indicate(mob, color, scale_factor)` | 闪烁指示 |
| `FocusOn(mob)` | 聚焦高亮 |
| `Flash(point, color, line_length, flash_radius)` | 闪光效果 |
| `ApplyWave(mob)` | 波浪效果 |
| `Wiggle(mob, scale_value, rotation_angle)` | 摇晃 |
| `Circumscribe(mob, shape, fade_out, color)` | 环绕框 |
| `SurroundingRectangle(mob, color, buff)` | 包围矩形 |
| `ShowPassingFlashAround(mob, time_width, color)` | 闪光环绕 |
| `ShowCreationThenDestructionAround(mob, color)` | 创建后销毁环绕 |
| `ShowCreationThenFadeAround(mob, color)` | 创建后淡出环绕 |

### 移动/旋转

| 动画 | 说明 |
|------|------|
| `MoveToTarget(mob)` | 移动到目标 |
| `MoveAlongPath(mob, path)` | 沿路径移动 |
| `PhaseFlow(func, mob, run_time)` | 相位流 |

### 批量/延迟

| 动画 | 说明 |
|------|------|
| `LaggedStart(*animations, lag_ratio=0.1)` | 逐个延迟启动动画 |
| `LaggedStartMap(anim_class, mobject, lag_ratio=0.1)` | 批量延迟启动 |

### 流线/向量场

| 类/方法 | 说明 |
|---------|------|
| `StreamLines(func, stroke_width, max_anchors_per_line)` | 流线动画 |
| `stream_lines.start_animation(warm_up, flow_speed)` | 启动流线动画 |
| `ArrowVectorField(func)` | 箭头向量场 |

### 网格变形

| 方法 | 说明 |
|------|------|
| `NumberPlane.prepare_for_nonlinear_transform()` | 准备非线性变换 |
| `grid.animate.apply_function(lambda p: ...)` | 对网格应用函数 |

### 复数变换

| 函数 | 说明 |
|------|------|
| `complex_to_R3(complex_number)` | 复数→3D坐标 |
| `R3_to_complex(point)` | 3D坐标→复数 |
| `mob.animate.apply_complex_function(np.exp)` | 对对象应用复数函数 |
| `mob.animate.apply_function(lambda p: ...)` | 对对象应用 R³→R³ 函数 |

### 动画组合

| 类 | 说明 |
|----|------|
| `AnimationGroup(*animations, lag_ratio=0)` | 动画组合（同时或延迟） |
| `LaggedStart(*animations, lag_ratio=0.1)` | 逐个延迟启动 |
| `LaggedStartMap(anim_class, mobject, lag_ratio=0.1)` | 批量延迟启动 |

### 坐标系绘图方法

| 方法 | 说明 |
|------|------|
| `axes.plot(func, color, x_range)` | 绘制函数图像 |
| `axes.get_area(curve, x_range, bounded_graph, color, opacity)` | 填充面积 |
| `axes.get_riemann_rectangles(curve, x_range, dx, color, fill_opacity)` | Riemann 矩形 |
| `axes.get_secant_slope_group(x, curve, dx, secant_line_color)` | 割线斜率组（切线近似） |
| `axes.get_graph_label(curve, label, x_val, direction)` | 图形标签 |
| `axes.get_vertical_line(point, color, line_func)` | 垂直线 |
| `axes.c2p(x, y)` | 坐标→屏幕点（同 `coords_to_point`） |
| `axes.i2gp(x, curve)` | 输入值→图形上的点 |
| `axes.plot_line_graph(x_values, y_values)` | 绘制折线图 |

### Matrix 方法

| 方法 | 说明 |
|------|------|
| `Matrix(data, left_bracket, right_bracket, v_buff, h_buff)` | 创建矩阵 |
| `matrix.set_column_colors(*colors)` | 按列着色 |
| `matrix.set_row_colors(*colors)` | 按行着色 |
| `matrix.get_columns()` | 获取列（可添加 SurroundingRectangle） |
| `matrix.get_rows()` | 获取行 |
| `matrix.add_background_to_entries()` | 给元素添加背景 |

**括号类型**: `[` `]` `(` `)` `\{` `\}` `\langle` `\rangle` `|` `\|`
| `Rotate(mob, angle)` | 旋转 |
| `Rotating(mob)` | 持续旋转（更流畅） |

### Rotating vs rotate

```python
# Rotating: 每帧创建 target，更流畅
self.play(Rotating(sq, about_point=ORIGIN, radians=TAU / 3))

# rotate: 只生成一个 target，中间补间动画
self.play(sq.rotate, {'about_point': ORIGIN, 'angle': TAU / 3})
```

### 组合

| 动画 | 说明 |
|------|------|
| `AnimationGroup(*anims)` | 动画组 |
| `LaggedStart(*anims)` | 延迟启动动画组 |
| `Succession(*anims)` | 串行动画 |

```python
# LaggedStart - 带延迟的并行
self.play(LaggedStart(
    Create(shapes[0]),
    Create(shapes[1]),
    Create(shapes[2]),
    lag_ratio=0.5,
))
```

### animate 语法糖

```python
self.play(mob.animate.shift(RIGHT))
self.play(mob.animate.set_color(RED))
self.play(mob.animate.scale(2).shift(UP))
# 链式调用：同时执行多个变换
self.play(square.animate.shift(RIGHT).rotate(PI / 4).set_color(BLUE))
```

### 动画 vs 即时变化

```python
# 动画变化（可见过渡）
self.play(circle.animate.set_color(RED))

# 即时变化（无动画）
circle.set_color(RED)
self.add(circle)
```

---

## 坐标系与绘图

### Axes 方法

```python
axes = Axes(
    x_range=[-5, 5, 1],    # [min, max, step]
    y_range=[-3, 3, 1],
    x_length=10,
    y_length=6,
    axis_config={"include_tip": True},
)

axes.plot(func, x_range=[0, 5], color=BLUE)
axes.plot_parametric_curve(lambda t: [x(t), y(t)], t_range=[0, TAU])
axes.get_axis_labels("x", "y")
axes.c2p(x, y)             # 坐标到屏幕点
axes.p2c(point)             # 屏幕点到坐标
axes.get_riemann_rectangles(curve, x_range, dx)
axes.get_secant_slope_group(x, graph, dx)
axes.get_area(curve, x_range)
axes.get_graph_label(graph, label, x_val)
axes.get_vertical_line_to_graph(x, graph)
```

### NumberPlane

```python
plane = NumberPlane(
    x_range=[-8, 8, 1],
    y_range=[-5, 5, 1],
    background_line_style={"stroke_color": GREY, "stroke_width": 1, "stroke_opacity": 0.5},
)
```

---

## 文本与公式

| 类 | 说明 |
|----|------|
| `Text("文本", font_size, color, slant, weight)` | 普通文本（支持中文） |
| `Tex(r"$formula$")` | LaTeX 文本 |
| `MathTex(r"formula")` | LaTeX 数学公式（无需$） |
| `MarkupText("<b>bold</b>")` | 标记文本（支持 pango 标记） |
| `Code("code", language)` | 代码高亮显示 |
| `Paragraph("line1", "line2")` | 段落 |
| `DecimalNumber(0, num_decimal_places)` | 可变数字显示 |
| `Matrix([[...]], left_bracket, right_bracket)` | 矩阵显示 |
| `Underline(mobject, color)` | 下划线 |

### Text 样式参数

```python
Text("text", font_size=36, color=RED, slant=ITALIC, weight=BOLD, line_spacing=1.5)
text[0:5].set_color(BLUE)
text.set_color_by_gradient(RED, BLUE, GREEN)
```

### MarkupText 标记语法

```python
MarkupText('<b>Bold</b> <i>Italic</i> <u>Underline</u> <span fgcolor="red">Red</span>')
```

### Tex/MathTex 用法

```python
formula = MathTex(
    r"\int_0^\infty", r"e^{-x^2}", r"dx", r"=", r"\frac{\sqrt{\pi}}{2}"
)
formula[0].set_color(RED)      # 索引访问子公式
formula[1].set_color(BLUE)
```

### DecimalNumber + ValueTracker

```python
tracker = ValueTracker(0)
number = DecimalNumber(0, num_decimal_places=2, font_size=72)
number.add_updater(lambda m: m.set_value(tracker.get_value()))
self.add(number)
self.play(tracker.animate.set_value(100), run_time=3)
```

### TransformMatchingTex（公式变换）

```python
eq1 = MathTex("a", "^2", "+", "b", "^2")
eq2 = MathTex("a", "^2", "+", "2ab", "+", "b", "^2")
self.play(Write(eq1))
self.play(TransformMatchingTex(eq1, eq2))
```

---

## 颜色与样式

### 预定义颜色

```python
WHITE, BLACK, GREY, GREY_A, GREY_B, GREY_C, GREY_D, GREY_E
RED, RED_A, RED_B, RED_C, RED_D, RED_E
GREEN, GREEN_A, GREEN_B, GREEN_C, GREEN_D, GREEN_E
BLUE, BLUE_A, BLUE_B, BLUE_C, BLUE_D, BLUE_E
YELLOW, YELLOW_A, YELLOW_B, YELLOW_C, YELLOW_D, YELLOW_E
PURPLE, PURPLE_A, PURPLE_B, PURPLE_C, PURPLE_D, PURPLE_E
ORANGE, ORANGE_A, ORANGE_B, ORANGE_C, ORANGE_D, ORANGE_E
TEAL, MAROON, PINK, GOLD
```

### 颜色操作

```python
interpolate_color(color1, color2, alpha)  # 颜色插值
color_to_rgb(color)                        # 颜色转 RGB
rgb_to_color(rgb)                          # RGB 转颜色
color_gradient([RED, BLUE], 5)            # 生成颜色梯度列表
```

### 渐变效果

```python
# 对象渐变
text.set_color_by_gradient(RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE)

# 按文本内容着色
text.set_color_by_t2c({'关键词1': RED, '关键词2': BLUE})
```

### 背景矩形

```python
bg = BackgroundRectangle(text, fill_opacity=0.8, buff=0.1)
self.add(bg, text)
```

---

## 缓动函数

```python
smooth              # 默认，平滑起停
linear              # 线性
rush_into           # 快起慢停
rush_from           # 慢起快停
slow_into           # 慢启动
double_smooth       # 双段平滑
there_and_back      # 去了又回
there_and_back_with_pause
running_start       # 带惯性
bounce_start        # 弹跳
elastic             # 弹性
```

---

## 常用常量

```python
ORIGIN = np.array([0, 0, 0])
UP = np.array([0, 1, 0])
DOWN = np.array([0, -1, 0])
LEFT = np.array([-1, 0, 0])
RIGHT = np.array([1, 0, 0])
IN = np.array([0, 0, -1])
OUT = np.array([0, 0, 1])

PI = np.pi
TAU = 2 * PI
DEGREES = TAU / 360

XL, XR = LEFT, RIGHT
YU, YD = UP, DOWN
ZI, ZO = IN, OUT
```

---

## 3D 相关

```python
class My3DScene(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=75*DEGREES, theta=-45*DEGREES)
        self.begin_ambient_camera_rotation(rate=0.2)
        self.stop_ambient_camera_rotation()
        self.move_camera(phi=..., theta=..., frame_center=...)
        self.add_fixed_orientation_mobjects(*mobs)
        self.add_fixed_in_frame_mobjects(*mobs)
```

### 3D 对象（已移至上方几何图形/3D对象章节）

> 3D 对象列表已整合到上方 "3D 对象" 章节，新增 `Torus`、`Line3D` 等。

---

## 高级动画模式

### TracedPath（轨迹追踪）

```python
dot = Dot()
path = TracedPath(dot.get_center, stroke_width=2, stroke_color=BLUE)
self.add(dot, path)
self.play(dot.animate.shift(RIGHT * 3 + UP * 2), run_time=3)
```

### ValueTracker 完整模式

```python
tracker = ValueTracker(0)

# 获取/设置值
current = tracker.get_value()
tracker.set_value(10)
tracker.increment_value(2.5)

# 算术运算
tracker += 1
tracker -= 2
tracker *= 3

# 动画变化
self.play(tracker.animate.set_value(100))
self.play(tracker.animate.increment_value(-50))
```

### save_state / restore 模式

```python
text.save_state()
self.play(text.animate.shift(RIGHT * 3).set_color(RED))
self.wait()
self.play(Restore(text))  # 回到保存的状态
```

### DashedVMobject（虚线）

```python
dashed_circle = DashedVMobject(Circle(radius=3, color=GRAY))
dashed_line = DashedVMobject(Line(LEFT * 5, RIGHT * 5, color=GRAY))
```

---

## 布尔运算

```python
ellipse1 = Ellipse(width=4.0, height=5.0, fill_opacity=0.5, color=BLUE)
ellipse2 = ellipse1.copy().set_color(RED).move_to(RIGHT)

intersection = Intersection(ellipse1, ellipse2, color=GREEN, fill_opacity=0.5)
union = Union(ellipse1, ellipse2, color=ORANGE, fill_opacity=0.5)
exclusion = Exclusion(ellipse1, ellipse2, color=YELLOW, fill_opacity=0.5)
difference = Difference(ellipse1, ellipse2, color=PURPLE, fill_opacity=0.5)
```

---

## 标注与装饰

### Brace（大括号标注）

```python
square = Square(side_length=2)
brace = Brace(square, LEFT)           # 左侧大括号
brace_text = brace.get_text("9")      # 大括号文字
brace_tex = brace.get_tex("x_1")      # 大括号公式
```

### SurroundingRectangle（包围矩形）

```python
rect = SurroundingRectangle(formula, color=YELLOW, buff=0.1)
```

### Arc 角度标注

```python
arc = Arc(radius=0.3, arc_center=np.array([-1, 0, 0]),
          start_angle=0, angle=31.5 * DEGREES)
```

### VectorArrow（向量箭头标注）

```python
dot = Dot(ORIGIN)
arrow = Arrow(ORIGIN, [2, 2, 0], buff=0)
numberplane = NumberPlane()
origin_text = Text('(0, 0)').next_to(dot, DOWN)
tip_text = Text('(2, 2)').next_to(arrow.get_end(), RIGHT)
```

---

## 版本差异

### 导入差异

```python
# 3b1b 原版
from manimlib import *

# ManimCommunity 社区版
from manim import *
```

### API 差异

| 功能 | 3b1b 原版 | 社区版 |
|------|----------|--------|
| 配置文件 | `custom_config.yml` | `manim.cfg` |
| 命令行 | `python -m manim` / `manimgl` | `manim` |
| 实时预览 | `--renderer=opengl` | `--renderer=opengl` |
| always_redraw | 无 | `always_redraw` |
| 响应式 | `add_updater` | `add_updater` / `always_redraw` / `f_always` |
| 3D 相机 | `self.camera.frame` | `self.camera` |
| 文本 | `Text` | `Text` / `MarkupText` |
| 代码显示 | 无 | `Code` |
| 插件 | 无 | `manim.plugins` |
| 数学公式 | `Tex(R"\pi")` | `MathTex(r"\pi")` |
| 场景 | `InteractiveScene` | `Scene` |
| 安装包 | `manimgl` (PyPI) | `manim` (PyPI) |

### 常见陷阱

1. **版本混淆** - 确保使用 `manim`（社区版）而非 `manimgl`（3b1b 版）
2. **导入检查** - `from manim import *` 是社区版；`from manimlib import *` 是 3b1b 版
3. **过时教程** - 视频教程可能过时，优先参考官方文档
4. **manimpango 问题** - 文本渲染失败时检查 manimpango 安装
5. **Windows PATH** - `manim` 命令未找到时使用 `python -m manim`

---

## 常见陷阱

| 陷阱 | 原因 | 解决方案 |
|------|------|---------|
| **Transform修改了原对象** | Transform就地修改 | 用 `a.copy()` 或换成 `ReplacementTransform` |
| **LaTeX中文乱码** | Cairo后端CTEX问题 | 中文用 `Text()`，不用 `MathTex` |
| **对象不显示** | 忘记 `play()/add()` | 确保每个对象经过 `play()` 或 `add()` |
| **Updater内存泄漏** | Updater持续运行不释放 | 场景结束时调用 `clear_updaters()` |
| **渲染极慢** | Mobject过多/分辨率太高 | 开发用 `-pql`，减少不必要的Mobject |
| **颜色看起来不对** | 色彩空间差异 | 始终用 `_C` 后缀版本(`BLUE_C`) |
| **ReplacementTransform闪烁** | Mobject类型不匹配 | 确保 source 和 target 类型兼容 |
| **数学字体不好看** | 未配置LaTeX字体 | config中设置 `TEX_AMS_MATH` |
| **裸公式无几何图像** | 违反3b1b风格DNA | 每引入公式前必须有对应几何图像 |
| **信息密度过高** | 同时太多活跃元素 | 单帧≤5元素，分批FadeIn |
| **节奏无呼吸感** | 缺少wait()停顿 | 关键信息后加 `self.wait(Timing.PAUSE_MEDIUM)` |
| **中文显示方块** | 未指定中文字体 | `Text("中文", font="Noto Sans CJK SC")` |
| **FFmpeg找不到** | 旧版本需手动安装 | v0.19.0+ 不再需要，pyav自动安装 |

## 交互模式

```python
self.embed()  # 进入交互终端

# 交互终端中可用命令:
# play(anim)          播放动画
# mob.animate.xxx     生成动画
# mob.get_center()    查询属性
# exit()              退出交互
```

## 配置系统

```python
# 代码内配置
config.background_color = "#1e1e2e"
config.frame_rate = 60
config.pixel_height = 1080
config.pixel_width = 1920
```

```ini
# manim.cfg 项目级配置
[CLI]
output_file = my_animation
media_dir = ./output

[renderer]
background_color = #1e1e2e
frame_rate = 60
pixel_height = 1080
pixel_width = 1920
```

## 中文字体

```python
import manimpango
print(manimpango.list_fonts())  # 查看可用字体

Text("中文", font="Noto Sans CJK SC")     # Linux/Mac
Text("中文", font="Microsoft YaHei")       # Windows
Text("中文", font="Source Han Sans")       # 跨平台
```

## 项目初始化

```bash
# v0.19.0+ 内置项目初始化
manim init project my-project --default

# uv 安装（官方推荐）
uv init my-animations && cd my-animations
uv add manim
uv run manim --version
```

## 图片讲解视频工具

> v2.4.0 新增。详细模板和完整示例见 `references/image_to_animation.md`。

### 图片讲解专用配色

```python
class ExplanationColors:
    GIVEN = BLUE_C          # 已知条件
    DERIVED = TEAL_C        # 推导出的结论
    AUXILIARY = YELLOW_C    # 辅助线
    RESULT = RED_C          # 最终结果
    FIGURE = WHITE          # 基本图形
    ANGLE = GREEN_C         # 角度标注
```

### 几何图形重建 API

| 方法 | 说明 |
|------|------|
| `Polygon(*vertices, color)` | 从顶点坐标构建多边形 |
| `Circle(arc_center, radius, color)` | 从圆心+半径构建圆 |
| `Line(start, end, color)` | 构建线段 |
| `DashedLine(start, end, color, dash_length)` | 构建虚线（辅助线） |
| `Angle(line1, line2, radius, color)` | 构建角度标注 |
| `Arc(arc_center, radius, start_angle, angle)` | 构建弧 |
| `ArcBetweenPoints(start, end, angle)` | 两点间弧 |
| `Dot(point, radius, color)` | 标注点 |
| `Arrow(start, end, buff, color)` | 向量/箭头 |
| `TangentLine(curve, alpha, length, color)` | 曲线切线 |

### 讲解动画模式速查

| 讲解步骤 | 推荐API | 示例 |
|---------|---------|------|
| 展示题目 | `Write` / `FadeIn` | `self.play(Write(title))` |
| 构建图形 | `Create` | `self.play(Create(triangle))` |
| 标注点 | `FadeIn(Dot)` + `Write(MathTex)` | `self.play(FadeIn(dot), Write(label))` |
| 高亮条件 | `Indicate` / `Circumscribe` | `self.play(Indicate(condition, color=YELLOW_C))` |
| 添加辅助线 | `Create(DashedLine)` | `self.play(Create(DashedLine(A, B, color=YELLOW_C)))` |
| 角度标注 | `Create(Angle)` | `self.play(Create(Angle(l1, l2, color=GREEN_C)))` |
| 公式推导 | `TransformMatchingTex` | `self.play(TransformMatchingTex(eq1, eq2))` |
| 逐步计算 | `Write(MathTex)` 循环 | 逐行 Write + wait |
| 强调结论 | `Circumscribe` + 变色 | `self.play(Circumscribe(result, color=RED_C))` |
| 题目缩小让位 | `.animate.scale().to_corner()` | `title.animate.scale(0.6).to_corner(UL)` |
| 面积填充 | `axes.get_area` | `self.play(FadeIn(axes.get_area(curve, x_range=[0,2])))` |
| Riemann矩形 | `axes.get_riemann_rectangles` | `self.play(FadeIn(axes.get_riemann_rectangles(curve, dx=0.5)))` |
| 切线斜率 | `axes.get_secant_slope_group` | `self.play(Create(axes.get_secant_slope_group(x, curve)))` |

### 题型→模板映射

| 题型 | 推荐Scene结构 | 关键Mobject |
|------|-------------|------------|
| 几何证明/计算 | `show_problem` → `build_figure` → `analyze` → `key_insight` → `proof` → `conclusion` | `Polygon` / `Circle` / `Angle` / `DashedLine` |
| 函数极值 | `show_problem` → `draw_axes` → `plot_func` → `find_critical` → `result` | `Axes` / `plot` / `get_secant_slope_group` / `Dot` |
| 定积分 | `show_problem` → `draw_axes` → `plot_func` → `riemann` → `calculate` → `result` | `Axes` / `get_area` / `get_riemann_rectangles` |
| 方程求解 | `show_problem` → `visualize_roots` → `solve_steps` → `result` | `Axes` / `plot` / `Dot` / `TransformMatchingTex` |
| 向量运算 | `show_problem` → `show_vectors` → `show_operation` → `result` | `Arrow` / `Vector` / `Polygon`(平行四边形) |
| 物理运动 | `show_problem` → `setup_scene` → `animate_motion` → `result` | `ValueTracker` / `TracedPath` / `Arrow` |

## 研究员模式工具

> v2.5.0 新增。详细工作流和示例见 `references/research_workflow.md`。

### ResearchReport 结构

```python
class ResearchReport:
    topic: str                    # 主题
    core_question: str            # 核心问题
    key_findings: list            # 关键发现
    theorems: list                # 相关定理/公式
    experiments: list             # 经典实验/现象
    classic_examples: list        # 经典例题
    historical_context: str       # 历史背景
    misconceptions: list          # 常见误解
    best_analogies: list          # 最佳类比/隐喻
    narrative_structure: dict     # 教学叙事结构
    visual_elements: list         # 可视化元素清单
    sources: list                 # 信息来源列表
```

### 信息质量评分

| 维度 | 权重 | 说明 |
|------|------|------|
| 相关度 | ×3 | 与核心问题的相关程度 |
| 权威性 | ×2 | 来源的权威程度 |
| 可理解性 | ×2 | 目标观众的可理解程度 |
| 可视化潜力 | ×2 | 能否转化为Manim动画 |
| 新颖度 | ×1 | 信息的独特视角 |

**保留标准**: 综合分 ≥ 3.0

### 调研→动画转化映射

| 调研元素 | 脚本位置 | 推荐动画 |
|---------|---------|---------|
| 历史故事 | 开场悬念 | 时间线 / FadeIn人物 |
| 直觉/类比 | 第一幕 | 隐喻可视化（查隐喻库2.6） |
| 定理/公式 | 第二幕 | `Write(MathTex)` + 几何对应 |
| 经典例题 | 第三幕 | 完整解题动画 |
| 常见误解 | 澄清段落 | 对比动画（错误vs正确） |
| 实验/现象 | 直觉佐证 | 物理模拟 / `ValueTracker` |
| 应用场景 | 收尾 | 应用展示 / `FadeIn` |

### 各学科搜索策略

| 学科 | 核心搜索词模板 | 经典来源 |
|------|-------------|---------|
| 微积分 | "{概念} intuition/几何意义" | 3b1b Essence of Calculus |
| 线性代数 | "{概念} linear transformation" | 3b1b Essence of Linear Algebra |
| 概率统计 | "{概念} visualized/大数定律" | Seeing Theory (Brown Univ) |
| 力学 | "Newton's laws derivation" | Feynman Lectures |
| 电磁学 | "Maxwell's equations intuition" | Griffiths Introduction |
| 量子力学 | "double slit experiment" | Feynman QED |
| 神经网络 | "backpropagation intuition" | 3b1b Neural Networks |
| Transformer | "attention mechanism visualized" | Jay Alammar's blog |

## 默认视频生成规范工具（v2.6.1）

> 所有视频生成必须遵守的默认规范。详见 SKILL.md 十八、默认视频生成规范。

### 闪烁工具函数

```python
def flash_key(self, mob, color=YELLOW_C):
    """关键元素闪烁：3次×0.25秒"""
    for _ in range(3):
        self.play(Indicate(mob, color=color, scale_factor=1.2), run_time=0.25)

def flash_normal(self, mob, color=YELLOW_C):
    """一般元素闪烁：2次×0.25秒"""
    for _ in range(2):
        self.play(Indicate(mob, color=color, scale_factor=1.15), run_time=0.25)
```

| 元素类型 | 闪烁次数 | 每次时长 | 适用对象 |
|---------|---------|---------|---------|
| 关键元素 | 3次 | 0.25秒 | 角、边、全等结论等核心证明要素 |
| 一般元素 | 2次 | 0.25秒 | 直线、标签、三角形等辅助要素 |

### 线段交点手动计算

```python
def line_intersection(p1, p2, p3, p4):
    """ManimCommunity无get_intersection，手动计算线段交点"""
    x1, y1 = p1[0], p1[1]
    x2, y2 = p2[0], p2[1]
    x3, y3 = p3[0], p3[1]
    x4, y4 = p4[0], p4[1]
    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-10:
        return None
    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    x = x1 + t * (x2 - x1)
    y = y1 + t * (y2 - y1)
    return np.array([x, y, 0])
```

### 边标注方向计算

```python
def get_outward_direction(line, center=ORIGIN):
    """计算边标注的外侧方向"""
    mid = line.get_center()
    direction = mid - center
    norm = np.linalg.norm(direction)
    if norm < 1e-10:
        return UP
    return direction / norm
```

### 默认技术栈配置

| 配置项 | 默认值 |
|--------|--------|
| Scene基类 | `VoiceoverScene` |
| 语音服务 | `EdgeTTSService(voice="zh-CN-YunyangNeural")` |
| 分辨率 | 1920×1080 |
| 帧率 | 60fps |
| 后期加速 | 1.3x（视频+音频同步） |
| 字幕方式 | SRT烧录（FontSize=18） |
| 文字动画 | `FadeIn(text, shift=RIGHT * 0.3)` |
| 辅助线 | `DashedLine(..., dash_length=0.15)` |
| Mobject清理 | `FadeOut(var)` |

### 图形变形边界约束

```python
FRAME_WIDTH = 14.2
FRAME_HEIGHT = 8.0

def clamp_figure(figure_group, title_mob=None, subtitle_y=-3.2):
    """
    确保图形组在标题和字幕之间，左右不超出屏幕。
    优先缩放，其次平移，绝不裁剪。保证图形完整性和有效性。
    """
    title_bottom = title_mob.get_bottom()[1] if title_mob else 3.0
    fig_top = figure_group.get_top()[1]
    fig_bottom = figure_group.get_bottom()[1]
    fig_left = figure_group.get_left()[0]
    fig_right = figure_group.get_right()[0]

    safe_y_top = title_bottom - 0.2
    safe_y_bottom = subtitle_y + 0.2
    safe_x_left = -FRAME_WIDTH / 2 + 0.3
    safe_x_right = FRAME_WIDTH / 2 - 0.3

    y_overflow_top = max(0, fig_top - safe_y_top)
    y_overflow_bottom = max(0, safe_y_bottom - fig_bottom)
    x_overflow_left = max(0, safe_x_left - fig_left)
    x_overflow_right = max(0, fig_right - safe_x_right)

    max_y_overflow = max(y_overflow_top, y_overflow_bottom)
    max_x_overflow = max(x_overflow_left, x_overflow_right)

    if max_y_overflow > 0 or max_x_overflow > 0:
        available_height = safe_y_top - safe_y_bottom
        available_width = safe_x_right - safe_x_left
        current_height = fig_top - fig_bottom
        current_width = fig_right - fig_left

        scale_y = available_height / current_height if current_height > 0 else 1
        scale_x = available_width / current_width if current_width > 0 else 1
        scale_factor = min(scale_y, scale_x, 1.0)

        if scale_factor < 1.0:
            figure_group.scale(scale_factor)

    center_y = (safe_y_top + safe_y_bottom) / 2
    center_x = 0
    figure_group.move_to(np.array([center_x, center_y, 0]))
```

| 约束方向 | 边界 | 安全边距 |
|---------|------|---------|
| 上方 | 标题下沿 - 0.2 | 标题与图形间距 |
| 下方 | 字幕上沿 + 0.2 | 字幕与图形间距 |
| 左右 | 屏幕边缘 ± 0.3 | 安全边距 |

**关键原则**：完整性优先（宁可缩小不裁剪）、有效性保证（缩放后标注清晰）、动态适应（变形后重新约束）

### 后期处理管线

```bash
# 1. 渲染（manim-voiceover自动生成SRT）
manim -pqh scene.py SceneName

# 2. 烧录字幕（先字幕再加速）
ffmpeg -i output.mp4 -vf "subtitles=output.srt:force_style='FontSize=18,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2'" -c:a copy subtitled.mp4

# 3. 1.3x加速（视频+音频同步）
ffmpeg -i subtitled.mp4 -filter_complex "[0:v]setpts=PTS/1.3[v];[0:a]atempo=1.3[a]" -map "[v]" -map "[a]" final.mp4
```
