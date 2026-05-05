# 机器学习动画模板

参考 ManimML 项目的设计理念，为机器学习概念提供可视化动画模板。

## 目录
1. [神经网络动画](#神经网络动画)
2. [训练过程动画](#训练过程动画)
3. [决策边界动画](#决策边界动画)
4. [损失函数动画](#损失函数动画)
5. [注意力机制动画](#注意力机制动画)
6. [通用 ML 工具](#通用-ml-工具)

---

## 神经网络动画

### 全连接网络可视化

```python
class FullyConnectedNetwork(Scene):
    def construct(self):
        layer_sizes = [3, 5, 4, 2]
        layer_spacing = 2.5
        node_spacing = 0.8
        node_radius = 0.15

        layers = VGroup()
        all_nodes = []

        for i, size in enumerate(layer_sizes):
            layer_nodes = VGroup()
            for j in range(size):
                node = Circle(radius=node_radius, color=BLUE, fill_opacity=0.3)
                node.move_to(UP * (size - 1) * node_spacing / 2 - j * node_spacing * UP)
                layer_nodes.add(node)
            layer_nodes.move_to(RIGHT * i * layer_spacing - RIGHT * (len(layer_sizes) - 1) * layer_spacing / 2)
            layers.add(layer_nodes)
            all_nodes.append(layer_nodes)

        connections = VGroup()
        for i in range(len(all_nodes) - 1):
            for node_a in all_nodes[i]:
                for node_b in all_nodes[i + 1]:
                    line = Line(node_a.get_center(), node_b.get_center(), color=GREY, stroke_width=0.5)
                    connections.add(line)

        layer_labels = VGroup(
            Text("输入层", font_size=20).next_to(all_nodes[0], DOWN),
            Text("隐藏层1", font_size=20).next_to(all_nodes[1], DOWN),
            Text("隐藏层2", font_size=20).next_to(all_nodes[2], DOWN),
            Text("输出层", font_size=20).next_to(all_nodes[3], DOWN),
        )

        self.play(FadeIn(connections), run_time=1)
        for layer in all_nodes:
            self.play(FadeIn(layer), run_time=0.5)
        self.play(Write(layer_labels))
        self.wait()
```

### 信号前向传播

```python
class ForwardPropagation(Scene):
    def construct(self):
        layer_sizes = [3, 4, 2]
        layer_spacing = 3
        node_spacing = 1

        all_nodes = []
        for i, size in enumerate(layer_sizes):
            layer = VGroup()
            for j in range(size):
                node = Circle(radius=0.2, color=BLUE, fill_opacity=0.2)
                node.move_to(
                    RIGHT * i * layer_spacing
                    + UP * (size - 1) * node_spacing / 2
                    - j * node_spacing * UP
                )
                layer.add(node)
            all_nodes.append(layer)

        connections = VGroup()
        for i in range(len(all_nodes) - 1):
            for na in all_nodes[i]:
                for nb in all_nodes[i + 1]:
                    connections.add(Line(na.get_center(), nb.get_center(), color=GREY, stroke_width=0.5))

        self.add(connections, *all_nodes)

        for i in range(len(all_nodes) - 1):
            signals = VGroup()
            for na in all_nodes[i]:
                for nb in all_nodes[i + 1]:
                    dot = Dot(na.get_center(), radius=0.05, color=YELLOW)
                    signals.add(dot)

            self.play(
                *[
                    dot.animate.move_to(
                        all_nodes[i + 1][j % len(all_nodes[i + 1])].get_center()
                    )
                    for j, dot in enumerate(signals)
                ],
                run_time=1,
            )

            for node in all_nodes[i + 1]:
                self.play(
                    node.animate.set_fill(YELLOW, opacity=0.6),
                    run_time=0.3,
                )
        self.wait()
```

### 卷积神经网络

```python
class ConvolutionalNetwork(Scene):
    def construct(self):
        def make_feature_map(width, height, color=BLUE, fill_opacity=0.3):
            return Rectangle(
                width=width, height=height,
                fill_color=color, fill_opacity=fill_opacity,
                stroke_color=color,
            )

        input_maps = VGroup(*[
            make_feature_map(1.5, 1.5, BLUE).shift(LEFT * 0.3 * i)
            for i in range(3)
        ]).shift(LEFT * 5)

        conv_maps = VGroup(*[
            make_feature_map(1.2, 1.2, GREEN).shift(LEFT * 0.25 * i)
            for i in range(6)
        ]).shift(LEFT * 1.5)

        pool_maps = VGroup(*[
            make_feature_map(0.8, 0.8, ORANGE).shift(LEFT * 0.2 * i)
            for i in range(6)
        ]).shift(RIGHT * 1.5)

        fc_layers = VGroup(
            Rectangle(width=0.5, height=2, fill_color=RED, fill_opacity=0.3, stroke_color=RED),
            Rectangle(width=0.5, height=1.2, fill_color=RED, fill_opacity=0.3, stroke_color=RED),
            Rectangle(width=0.5, height=0.6, fill_color=RED, fill_opacity=0.3, stroke_color=RED),
        ).arrange(RIGHT, buff=0.3).shift(RIGHT * 4.5)

        labels = VGroup(
            Text("输入", font_size=18).next_to(input_maps, DOWN),
            Text("卷积", font_size=18).next_to(conv_maps, DOWN),
            Text("池化", font_size=18).next_to(pool_maps, DOWN),
            Text("全连接", font_size=18).next_to(fc_layers, DOWN),
        )

        arrows = VGroup(
            Arrow(input_maps.get_right(), conv_maps.get_left(), color=WHITE),
            Arrow(conv_maps.get_right(), pool_maps.get_left(), color=WHITE),
            Arrow(pool_maps.get_right(), fc_layers.get_left(), color=WHITE),
        )

        self.add(input_maps, conv_maps, pool_maps, fc_layers, labels, arrows)
        self.wait()
```

---

## 训练过程动画

### 梯度下降

```python
class GradientDescent(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-3, 3],
            y_range=[0, 8],
            x_length=8,
            y_length=5,
        ).shift(DOWN * 0.5)

        func = lambda x: x ** 2 + 0.5 * np.sin(2 * x) + 3
        curve = axes.plot(func, color=BLUE)

        x_tracker = ValueTracker(2.5)
        lr = 0.1

        point = always_redraw(
            lambda: Dot(
                axes.c2p(x_tracker.get_value(), func(x_tracker.get_value())),
                color=RED,
            )
        )

        grad_arrow = always_redraw(
            lambda: Arrow(
                axes.c2p(x_tracker.get_value(), func(x_tracker.get_value())),
                axes.c2p(
                    x_tracker.get_value() - lr * (2 * x_tracker.get_value() + np.cos(2 * x_tracker.get_value())),
                    func(x_tracker.get_value()),
                ),
                color=YELLOW,
                buff=0,
            )
        )

        x_label = always_redraw(
            lambda: MathTex(
                rf"x = {x_tracker.get_value():.2f}"
            ).to_edge(UP)
        )

        self.add(axes, curve, point, x_label)
        steps = [2.5]
        for _ in range(30):
            x = steps[-1]
            grad = 2 * x + np.cos(2 * x)
            steps.append(x - lr * grad)

        for x_new in steps[1:]:
            self.play(x_tracker.animate.set_value(x_new), run_time=0.3)
        self.wait()
```

### 学习率对比

```python
class LearningRateComparison(Scene):
    def construct(self):
        func = lambda x: x ** 2

        lrs = [0.05, 0.2, 0.8]
        colors = [BLUE, GREEN, RED]
        labels = [r"\alpha=0.05", r"\alpha=0.2", r"\alpha=0.8"]

        for lr, color, label in zip(lrs, colors, labels):
            axes = Axes(x_range=[-3, 3], y_range=[0, 9], x_length=3, y_length=3)
            curve = axes.plot(func, color=WHITE)
            axes.add(curve)

            x = 2.5
            path_points = [axes.c2p(x, func(x))]
            for _ in range(20):
                x = x - lr * 2 * x
                path_points.append(axes.c2p(x, func(x)))

            path = VMobject().set_points_as_corners(path_points).set_stroke(color, 2)
            axes.add(path)

            label_mob = MathTex(label, color=color, font_size=24).next_to(axes, UP)
            axes.add(label_mob)

        axes_group = VGroup(*axes_list).arrange(RIGHT, buff=1)
        self.add(axes_group)
        self.wait()
```

---

## 决策边界动画

### 分类决策边界演化

```python
class DecisionBoundary(Scene):
    def construct(self):
        np.random.seed(42)
        n_points = 50

        class_a = np.random.randn(n_points, 2) + np.array([1, 1])
        class_b = np.random.randn(n_points, 2) + np.array([-1, -1])

        axes = Axes(
            x_range=[-4, 4],
            y_range=[-4, 4],
            x_length=7,
            y_length=7,
        )

        dots_a = VGroup(*[
            Dot(axes.c2p(p[0], p[1]), color=BLUE, radius=0.06)
            for p in class_a
        ])
        dots_b = VGroup(*[
            Dot(axes.c2p(p[0], p[1]), color=RED, radius=0.06)
            for p in class_b
        ])

        boundary = axes.plot(
            lambda x: -x,
            color=YELLOW,
            x_range=[-4, 4],
        )

        self.add(axes, dots_a, dots_b)
        self.play(Create(boundary), run_time=2)
        self.wait()
```

---

## 损失函数动画

### 损失曲面

```python
class LossSurface(ThreeDScene):
    def construct(self):
        axes = ThreeDAxes(
            x_range=[-3, 3],
            y_range=[-3, 3],
            z_range=[0, 10],
        )
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        surface = Surface(
            lambda u, v: axes.c2p(
                u, v,
                0.5 * u ** 2 + 0.5 * v ** 2 + np.sin(u) * np.cos(v) + 3
            ),
            u_range=[-3, 3],
            v_range=[-3, 3],
            fill_opacity=0.5,
            checkerboard_colors=[BLUE_D, BLUE_E],
        )

        self.add(axes, surface)
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
```

---

## 注意力机制动画

### 自注意力可视化

```python
class SelfAttention(Scene):
    def construct(self):
        words = ["The", "cat", "sat", "on", "the", "mat"]
        n = len(words)

        tokens = VGroup(*[
            Text(w, font_size=28).set_background_stroke(width=0)
            for w in words
        ]).arrange(RIGHT, buff=0.5)

        attention_weights = np.random.dirichlet(np.ones(n), size=n)

        arrows = VGroup()
        for i in range(n):
            for j in range(n):
                weight = attention_weights[i][j]
                if weight > 0.1:
                    arrow = CurvedArrow(
                        tokens[i].get_top(),
                        tokens[j].get_top(),
                        color=interpolate_color(BLUE, RED, weight),
                        stroke_width=2 * weight * 10,
                        tip_length=0.15,
                    ).shift(UP * 0.3)
                    arrows.add(arrow)

        self.add(tokens)
        self.play(FadeIn(arrows, lag_ratio=0.1), run_time=2)
        self.wait()
```

---

## 通用 ML 工具

### 网络层绘制器

```python
def create_nn_layer(num_nodes, radius=0.15, color=BLUE, fill_opacity=0.3):
    layer = VGroup()
    for i in range(num_nodes):
        node = Circle(radius=radius, color=color, fill_opacity=fill_opacity)
        layer.add(node)
    layer.arrange(DOWN, buff=0.6)
    return layer

def connect_layers(layer1, layer2, color=GREY, stroke_width=0.5):
    connections = VGroup()
    for n1 in layer1:
        for n2 in layer2:
            connections.add(Line(n1.get_center(), n2.get_center(), color=color, stroke_width=stroke_width))
    return connections
```

### 激活函数绘制器

```python
def plot_activation(axes, func, x_range, color, label):
    curve = axes.plot(func, x_range=x_range, color=color)
    label_mob = MathTex(label, color=color, font_size=24).next_to(curve, UP)
    return VGroup(curve, label_mob)
```

### 数据分布绘制器

```python
def create_scatter_plot(axes, points, colors, radius=0.06):
    dots = VGroup()
    for point, color in zip(points, colors):
        dots.add(Dot(axes.c2p(point[0], point[1]), color=color, radius=radius))
    return dots
```
