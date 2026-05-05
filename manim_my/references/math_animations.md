# 数学动画模板

## 目录
1. [微积分动画](#微积分动画)
2. [线性代数动画](#线性代数动画)
3. [概率与统计动画](#概率与统计动画)
4. [数论动画](#数论动画)
5. [几何动画](#几何动画)
6. [通用数学工具](#通用数学工具)

---

## 微积分动画

### 导数的几何意义

```python
class DerivativeGeometry(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-1, 7],
            y_range=[-1, 5],
            x_length=10,
            y_length=6,
        ).shift(DOWN * 0.5)
        labels = axes.get_axis_labels("x", "y")

        func = lambda x: 0.5 * x ** 2 - x + 1
        curve = axes.plot(func, color=BLUE)

        tracker = ValueTracker(1)

        secant = always_redraw(
            lambda: axes.get_secant_slope_group(
                x=tracker.get_value(),
                graph=curve,
                dx=0.5,
                secant_line_color=YELLOW,
                secant_line_length=4,
            )
        )

        tangent = always_redraw(
            lambda: axes.plot(
                lambda x: func(tracker.get_value())
                + (tracker.get_value() - 1) * (x - tracker.get_value()),
                color=RED,
                x_range=[tracker.get_value() - 3, tracker.get_value() + 3],
            )
        )

        point = always_redraw(
            lambda: Dot(axes.c2p(tracker.get_value(), func(tracker.get_value())), color=YELLOW)
        )

        deriv_label = always_redraw(
            lambda: MathTex(
                rf"f'({tracker.get_value():.1f}) = {tracker.get_value() - 1:.1f}"
            ).to_edge(UP)
        )

        self.add(axes, labels, curve, point, deriv_label)
        self.play(tracker.animate.set_value(5), run_time=4)
        self.wait()
```

### 黎曼和逼近定积分

```python
class RiemannSum(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 5],
            y_range=[0, 3],
            x_length=9,
            y_length=5,
        ).shift(DOWN * 0.3)
        labels = axes.get_axis_labels("x", "y")

        func = lambda x: 0.2 * x ** 2 + 0.3
        curve = axes.plot(func, color=BLUE, x_range=[0, 4])

        n_tracker = ValueTracker(4)

        rects = always_redraw(
            lambda: axes.get_riemann_rectangles(
                curve,
                x_range=[0, 4],
                dx=4 / int(n_tracker.get_value()),
                color=GREEN,
                fill_opacity=0.5,
            )
        )

        area_label = always_redraw(
            lambda: MathTex(
                rf"n = {int(n_tracker.get_value())}"
            ).to_edge(UP)
        )

        self.add(axes, labels, curve, rects, area_label)
        self.play(n_tracker.animate.set_value(50), run_time=4)
        self.wait()
```

### 泰勒展开逼近

```python
class TaylorExpansion(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-2 * PI, 2 * PI, PI],
            y_range=[-3, 3],
            x_length=12,
            y_length=5,
        ).shift(DOWN * 0.5)

        sin_curve = axes.plot(np.sin, color=BLUE, x_range=[-2 * PI, 2 * PI])
        sin_label = MathTex(r"\sin(x)", color=BLUE).to_edge(UP)

        n_tracker = ValueTracker(1)

        taylor_curve = always_redraw(
            lambda: axes.plot(
                lambda x: sum(
                    (-1) ** k * x ** (2 * k + 1) / np.math.factorial(2 * k + 1)
                    for k in range(int(n_tracker.get_value()))
                ),
                color=YELLOW,
                x_range=[-2 * PI, 2 * PI],
            )
        )

        order_label = always_redraw(
            lambda: MathTex(
                rf"n = {int(n_tracker.get_value())}",
                color=YELLOW,
            ).next_to(sin_label, RIGHT)
        )

        self.add(axes, sin_curve, sin_label, taylor_curve, order_label)
        self.play(n_tracker.animate.set_value(10), run_time=5)
        self.wait()
```

### 极限可视化

```python
class LimitVisualization(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-1, 5],
            y_range=[-1, 4],
            x_length=8,
            y_length=5,
        ).shift(DOWN * 0.5)

        func = lambda x: (x ** 2 - 1) / (x - 1) if abs(x - 1) > 0.01 else 2

        curve = axes.plot(func, x_range=[0, 4], color=BLUE)
        hole = Circle(radius=0.08, color=WHITE).move_to(axes.c2p(1, 2))

        tracker = ValueTracker(0.1)

        left_dot = always_redraw(
            lambda: Dot(
                axes.c2p(1 - tracker.get_value(), func(1 - tracker.get_value())),
                color=RED,
            )
        )
        right_dot = always_redraw(
            lambda: Dot(
                axes.c2p(1 + tracker.get_value(), func(1 + tracker.get_value())),
                color=GREEN,
            )
        )

        limit_text = MathTex(r"\lim_{x \to 1} \frac{x^2 - 1}{x - 1} = 2").to_edge(UP)

        self.add(axes, curve, hole, limit_text, left_dot, right_dot)
        self.play(tracker.animate.set_value(0.01), run_time=3)
        self.wait()
```

---

## 线性代数动画

### 线性变换

```python
class LinearTransformation(Scene):
    def construct(self):
        axes = NumberPlane(
            x_range=[-4, 4],
            y_range=[-4, 4],
            background_line_style={"stroke_opacity": 0.3},
        )

        basis_i = Arrow(ORIGIN, RIGHT, color=RED, buff=0)
        basis_j = Arrow(ORIGIN, UP, color=GREEN, buff=0)
        i_label = MathTex(r"\hat{i}", color=RED).next_to(basis_i, DOWN)
        j_label = MathTex(r"\hat{j}", color=GREEN).next_to(basis_j, LEFT)

        matrix = np.array([[2, 1], [1, 2]])

        new_i = Arrow(ORIGIN, matrix[:, 0][0] * RIGHT + matrix[:, 0][1] * UP, color=RED, buff=0)
        new_j = Arrow(ORIGIN, matrix[:, 1][0] * RIGHT + matrix[:, 1][1] * UP, color=GREEN, buff=0)

        matrix_tex = MathTex(
            r"\begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}"
        ).to_edge(UP)

        self.add(axes, basis_i, basis_j, i_label, j_label)
        self.play(Write(matrix_tex))
        self.play(
            Transform(basis_i, new_i),
            Transform(basis_j, new_j),
            run_time=2,
        )
        self.wait()
```

### 特征值与特征向量

```python
class EigenvalueDecomposition(Scene):
    def construct(self):
        matrix_tex = MathTex(
            r"A = \begin{bmatrix} 3 & 1 \\ 1 & 3 \end{bmatrix}"
        ).to_edge(UP)

        axes = NumberPlane(
            x_range=[-5, 5],
            y_range=[-5, 5],
        )

        eigvec1 = Arrow(ORIGIN, RIGHT + UP, color=YELLOW, buff=0)
        eigvec2 = Arrow(ORIGIN, RIGHT - UP, color=ORANGE, buff=0)

        transformed1 = Arrow(ORIGIN, 4 * RIGHT + 4 * UP, color=YELLOW, buff=0)
        transformed2 = Arrow(ORIGIN, 2 * RIGHT - 2 * UP, color=ORANGE, buff=0)

        ev1_label = MathTex(r"\lambda_1 = 4", color=YELLOW).next_to(eigvec1, RIGHT)
        ev2_label = MathTex(r"\lambda_2 = 2", color=ORANGE).next_to(eigvec2, RIGHT)

        self.add(axes, matrix_tex)
        self.play(GrowArrow(eigvec1), GrowArrow(eigvec2))
        self.play(Write(ev1_label), Write(ev2_label))
        self.play(
            Transform(eigvec1, transformed1),
            Transform(eigvec2, transformed2),
        )
        self.wait()
```

### 矩阵乘法的几何意义

```python
class MatrixMultiplicationGeometry(Scene):
    def construct(self):
        plane = NumberPlane(
            x_range=[-5, 5],
            y_range=[-5, 5],
            background_line_style={"stroke_opacity": 0.3},
        )

        square = Square(side_length=1).set_fill(BLUE, opacity=0.5).shift(LEFT * 3)
        square_label = Text("原始", font_size=24).next_to(square, DOWN)

        A = np.array([[1, 0.5], [0, 1]])
        B = np.array([[1, 0], [0.5, 1]])

        transformed_A = square.copy().apply_matrix(A).shift(LEFT)
        transformed_B = square.copy().apply_matrix(B).shift(RIGHT)
        transformed_AB = square.copy().apply_matrix(A @ B).shift(RIGHT * 3)

        self.add(plane, square, square_label)
        self.play(TransformFromCopy(square, transformed_A))
        self.play(TransformFromCopy(square, transformed_B))
        self.play(TransformFromCopy(square, transformed_AB))
        self.wait()
```

---

## 概率与统计动画

### 中心极限定理

```python
class CentralLimitTheorem(Scene):
    def construct(self):
        axes = Axes(
            x_range=[-4, 4],
            y_range=[0, 1.5],
            x_length=10,
            y_length=5,
        ).shift(DOWN * 0.5)

        n_tracker = ValueTracker(1)

        def sample_mean_dist(x, n):
            return np.exp(-x ** 2 * n / 2) / np.sqrt(2 * PI / n)

        dist_curve = always_redraw(
            lambda: axes.plot(
                lambda x: sample_mean_dist(x, int(n_tracker.get_value())),
                color=BLUE,
            )
        )

        normal_curve = axes.plot(
            lambda x: np.exp(-x ** 2 / 2) / np.sqrt(2 * PI),
            color=RED,
            stroke_width=2,
        )

        n_label = always_redraw(
            lambda: MathTex(rf"n = {int(n_tracker.get_value())}").to_edge(UP)
        )

        self.add(axes, dist_curve, normal_curve, n_label)
        self.play(n_tracker.animate.set_value(30), run_time=5)
        self.wait()
```

### 蒙特卡洛估算 π

```python
class MonteCarloPi(Scene):
    def construct(self):
        square = Square(side_length=5)
        circle = Circle(radius=2.5).set_fill(BLUE, opacity=0.1)
        group = VGroup(square, circle).move_to(ORIGIN)

        inside_dots = VGroup()
        outside_dots = VGroup()
        count = [0, 0]
        pi_estimate = MathTex(r"\pi \approx 0").to_edge(UP)

        for _ in range(500):
            x, y = np.random.uniform(-2.5, 2.5, 2)
            dot = Dot(np.array([x, y, 0]), radius=0.03)
            if x ** 2 + y ** 2 <= 2.5 ** 2:
                dot.set_color(BLUE)
                count[0] += 1
                inside_dots.add(dot)
            else:
                dot.set_color(RED)
                count[1] += 1
                outside_dots.add(dot)

        self.add(group)
        for i in range(0, 500, 10):
            batch = VGroup(*[inside_dots[j] for j in range(min(i, len(inside_dots)))]
                         + [outside_dots[j] for j in range(min(i, len(outside_dots)))])
            total = count[0] + count[1]
            if total > 0:
                pi_val = 4 * count[0] / total
                pi_estimate.become(MathTex(rf"\pi \approx {pi_val:.4f}").to_edge(UP))
            self.add(batch)
            self.wait(0.05)
```

### 贝叶斯更新

```python
class BayesianUpdate(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 1, 0.1],
            y_range=[0, 5],
            x_length=9,
            y_length=5,
        ).shift(DOWN * 0.5)
        label = Text("贝叶斯更新").to_edge(UP)

        prior = axes.plot(lambda x: 1, x_range=[0, 1], color=BLUE)
        likelihood = axes.plot(lambda x: 2 * x, x_range=[0, 1], color=GREEN)
        posterior = axes.plot(lambda x: 2 * x / 1, x_range=[0, 1], color=RED)

        prior_label = MathTex(r"\text{Prior}", color=BLUE).next_to(prior, UP)
        like_label = MathTex(r"\text{Likelihood}", color=GREEN).next_to(likelihood, UP)
        post_label = MathTex(r"\text{Posterior}", color=RED).next_to(posterior, UP)

        self.add(axes, label)
        self.play(Create(prior), Write(prior_label))
        self.play(Create(likelihood), Write(like_label))
        self.play(Create(posterior), Write(post_label))
        self.wait()
```

---

## 数论动画

### 素数螺旋

```python
class PrimeSpiral(Scene):
    def construct(self):
        dots = VGroup()
        for n in range(1, 500):
            angle = n * 0.5
            radius = 0.08 * np.sqrt(n)
            pos = np.array([radius * np.cos(angle), radius * np.sin(angle), 0])
            if all(n % i != 0 for i in range(2, int(np.sqrt(n)) + 1)):
                dot = Dot(pos, radius=0.03, color=YELLOW)
            else:
                dot = Dot(pos, radius=0.01, color=GREY_D)
            dots.add(dot)

        self.play(FadeIn(dots), run_time=3)
        self.wait()
```

### 欧拉公式可视化

```python
class EulersFormula(Scene):
    def construct(self):
        axes = ThreeDAxes()
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        t_range = np.linspace(0, TAU, 300)
        points = [
            axes.c2p(t, np.sin(t), np.cos(t))
            for t in t_range
        ]
        helix = VMobject().set_points_as_corners(points).set_stroke(BLUE, 2)

        circle_points = [
            axes.c2p(0, np.sin(t), np.cos(t))
            for t in t_range
        ]
        circle = VMobject().set_points_as_corners(circle_points).set_stroke(YELLOW, 1)

        sine_points = [
            axes.c2p(t, np.sin(t), -1.5)
            for t in t_range
        ]
        sine = VMobject().set_points_as_corners(sine_points).set_stroke(RED, 1)

        formula = MathTex(r"e^{i\theta} = \cos\theta + i\sin\theta").to_edge(UP)

        self.add(axes, helix, circle, sine, formula)
        self.begin_ambient_camera_rotation(rate=0.3)
        self.wait(5)
```

---

## 几何动画

### 分形：谢尔宾斯基三角形

```python
class SierpinskiTriangle(Scene):
    def construct(self):
        def sierpinski(vertices, depth):
            if depth == 0:
                return [Polygon(*vertices, fill_opacity=0.5, color=BLUE)]
            v1, v2, v3 = vertices
            m12 = (v1 + v2) / 2
            m23 = (v2 + v3) / 2
            m31 = (v3 + v1) / 2
            return (
                sierpinski([v1, m12, m31], depth - 1)
                + sierpinski([m12, v2, m23], depth - 1)
                + sierpinski([m31, m23, v3], depth - 1)
            )

        depth_tracker = ValueTracker(0)

        for d in range(6):
            triangles = sierpinski(
                [UP * 3, DOWN * 2 + LEFT * 3, DOWN * 2 + RIGHT * 3],
                d,
            )
            group = VGroup(*triangles)
            self.play(FadeIn(group), run_time=1)
            if d < 5:
                self.remove(group)
```

### 莫比乌斯变换

```python
class MobiusTransformation(Scene):
    def construct(self):
        circle = Circle(radius=2, color=BLUE)
        grid = VGroup(
            *[
                Line(UP * 2 + LEFT * 2 + i * 0.5 * RIGHT, DOWN * 2 + LEFT * 2 + i * 0.5 * RIGHT, color=GREY, stroke_width=1)
                for i in range(9)
            ],
            *[
                Line(LEFT * 2 + UP * 2 + i * 0.5 * DOWN, RIGHT * 2 + UP * 2 + i * 0.5 * DOWN, color=GREY, stroke_width=1)
                for i in range(9)
            ],
        )

        a, b, c, d = 1, 1, 0, 1

        def mobius(z):
            return (a * z + b) / (c * z + d)

        self.add(circle, grid)
        self.play(
            grid.animate.apply_function(
                lambda p: complex_to_R3(
                    mobius(R3_to_complex(p))
                )
            ),
            run_time=2,
        )
        self.wait()
```

---

## 通用数学工具

### 函数图像绘制器

```python
def create_function_plot(axes, func, x_range, color=BLUE, label=None):
    curve = axes.plot(func, x_range=x_range, color=color)
    if label:
        label_mob = MathTex(label, color=color).next_to(curve, UP)
        return VGroup(curve, label_mob)
    return curve
```

### 动画参数控制器

```python
def create_parametric_animation(axes, x_func, y_func, t_range, speed=1):
    tracker = ValueTracker(t_range[0])
    dot = always_redraw(
        lambda: Dot(
            axes.c2p(x_func(tracker.get_value()), y_func(tracker.get_value())),
            color=YELLOW,
        )
    )
    trail = always_redraw(
        lambda: axes.plot_parametric_curve(
            lambda t: [x_func(t), y_func(t)],
            t_range=[t_range[0], tracker.get_value()],
            color=BLUE,
        )
    )
    return tracker, dot, trail
```

### 坐标转换工具

```python
def polar_to_cartesian(r, theta):
    return np.array([r * np.cos(theta), r * np.sin(theta), 0])
