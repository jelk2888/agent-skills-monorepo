# 物理动画模板

## 目录
1. [力学动画](#力学动画)
2. [波动与振动动画](#波动与振动动画)
3. [电磁学动画](#电磁学动画)
4. [热力学动画](#热力学动画)
5. [光学动画](#光学动画)
6. [通用物理工具](#通用物理工具)

---

## 力学动画

### 抛体运动

```python
class ProjectileMotion(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 6, 1],
            x_length=10,
            y_length=6,
        ).to_edge(DOWN)
        labels = axes.get_axis_labels("x", "y")

        v0 = 5
        angle = 60 * DEGREES
        g = 9.8

        t_max = 2 * v0 * np.sin(angle) / g
        x_max = v0 * np.cos(angle) * t_max

        tracker = ValueTracker(0)

        dot = always_redraw(
            lambda: Dot(
                axes.c2p(
                    v0 * np.cos(angle) * tracker.get_value(),
                    v0 * np.sin(angle) * tracker.get_value()
                    - 0.5 * g * tracker.get_value() ** 2,
                ),
                color=YELLOW,
            )
        )

        trail = always_redraw(
            lambda: axes.plot(
                lambda x: x * np.tan(angle)
                - g * x ** 2 / (2 * v0 ** 2 * np.cos(angle) ** 2),
                x_range=[0, v0 * np.cos(angle) * tracker.get_value()],
                color=BLUE,
            )
        )

        vel_arrow = always_redraw(
            lambda: Arrow(
                dot.get_center(),
                dot.get_center()
                + axes.c2p(
                    v0 * np.cos(angle),
                    v0 * np.sin(angle) - g * tracker.get_value(),
                )
                - axes.c2p(0, 0),
                color=RED,
                buff=0,
            )
        )

        self.add(axes, labels, dot, trail)
        self.play(tracker.animate.set_value(t_max), run_time=3, rate_func=linear)
        self.wait()
```

### 弹簧振子

```python
class SpringOscillation(Scene):
    def construct(self):
        wall = Line(UP * 1.5 + LEFT * 4, DOWN * 1.5 + LEFT * 4, color=WHITE)
        wall_hatches = VGroup(
            *[
                Line(
                    LEFT * 4 + UP * 1.5 - i * 0.3 * RIGHT + 0.3 * DOWN,
                    LEFT * 4 + UP * 1.5 - i * 0.3 * RIGHT,
                    stroke_width=1,
                )
                for i in range(10)
            ]
        )

        tracker = ValueTracker(0)
        omega = 2
        amplitude = 2

        block = always_redraw(
            lambda: Square(side_length=0.8)
            .set_fill(BLUE, opacity=0.7)
            .set_stroke(WHITE)
            .move_to(RIGHT * (amplitude * np.cos(omega * tracker.get_value())))
        )

        spring = always_redraw(
            lambda: self._make_spring(
                LEFT * 4, block.get_left(), num_coils=12
            )
        )

        eq_line = DashedLine(UP * 2, DOWN * 2, color=GREY)

        self.add(wall, wall_hatches, eq_line, spring, block)
        self.play(tracker.animate.set_value(TAU), run_time=4, rate_func=linear)

    def _make_spring(self, start, end, num_coils=10):
        points = []
        direction = end - start
        length = np.linalg.norm(direction)
        unit = direction / length if length > 0.01 else RIGHT
        perp = rotate_vector(unit, PI / 2)

        n_points = num_coils * 4
        for i in range(n_points + 1):
            frac = i / n_points
            pos = start + direction * frac
            offset = perp * 0.3 * np.sin(frac * num_coils * TAU)
            if frac < 0.05 or frac > 0.95:
                offset = np.zeros(3)
            points.append(pos + offset)

        return VMobject().set_points_as_corners(points).set_stroke(WHITE, 2)
```

### 刚体旋转

```python
class RigidBodyRotation(Scene):
    def construct(self):
        tracker = ValueTracker(0)

        rod = always_redraw(
            lambda: Line(ORIGIN, RIGHT * 3, color=BLUE)
            .rotate(tracker.get_value(), about_point=ORIGIN)
        )

        mass = always_redraw(
            lambda: Dot(rod.get_end(), color=RED, radius=0.15)
        )

        angular_vel_text = always_redraw(
            lambda: MathTex(
                r"\omega = " + f"{2 * np.cos(tracker.get_value() / 2):.2f}"
            ).to_edge(UP)
        )

        pivot = Dot(ORIGIN, color=WHITE, radius=0.08)

        arc = always_redraw(
            lambda: Arc(
                radius=0.8,
                start_angle=0,
                angle=tracker.get_value(),
                color=YELLOW,
            )
        )

        self.add(pivot, rod, mass, angular_vel_text, arc)
        self.play(tracker.animate.set_value(TAU), run_time=4, rate_func=linear)
```

---

## 波动与振动动画

### 横波传播

```python
class TransverseWave(Scene):
    def construct(self):
        axes = NumberLine(x_range=[0, 10], length=12).shift(DOWN)
        wave_label = Text("横波传播").to_edge(UP)

        tracker = ValueTracker(0)
        wavelength = 3
        amplitude = 1.5
        speed = 2

        wave = always_redraw(
            lambda: axes.plot(
                lambda x: amplitude * np.sin(
                    TAU / wavelength * (x - speed * tracker.get_value())
                ),
                color=BLUE,
            )
        )

        dot = always_redraw(
            lambda: Dot(
                axes.c2p(5, amplitude * np.sin(
                    TAU / wavelength * (5 - speed * tracker.get_value())
                )),
                color=YELLOW,
            )
        )

        vert_arrow = always_redraw(
            lambda: Arrow(
                dot.get_center(),
                dot.get_center() + UP * 0.5 * np.cos(
                    TAU / wavelength * (5 - speed * tracker.get_value())
                ),
                color=RED,
                buff=0,
            )
        )

        self.add(axes, wave_label)
        self.play(
            tracker.animate.set_value(5),
            run_time=5,
            rate_func=linear,
        )
```

### 驻波形成

```python
class StandingWave(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 4 * PI, PI],
            y_range=[-2, 2, 1],
            x_length=10,
            y_length=4,
        ).shift(DOWN)

        tracker = ValueTracker(0)
        n = 2
        L = 4 * PI

        wave = always_redraw(
            lambda: axes.plot(
                lambda x: np.sin(n * x / L * PI) * np.cos(tracker.get_value()),
                color=BLUE,
            )
        )

        envelope_top = axes.plot(
            lambda x: np.sin(n * x / L * PI), color=GREY, stroke_width=1
        )
        envelope_bot = axes.plot(
            lambda x: -np.sin(n * x / L * PI), color=GREY, stroke_width=1
        )

        node_dots = VGroup(
            *[
                Dot(axes.c2p(i * L / n, 0), color=YELLOW, radius=0.08)
                for i in range(n + 1)
            ]
        )

        label = MathTex(rf"n = {n}").to_edge(UP)

        self.add(axes, envelope_top, envelope_bot, node_dots, label)
        self.play(tracker.animate.set_value(TAU), run_time=3, rate_func=linear)
```

### 多普勒效应

```python
class DopplerEffect(Scene):
    def construct(self):
        tracker = ValueTracker(0)
        source_speed = 1.5

        source = always_redraw(
            lambda: Dot(
                RIGHT * source_speed * tracker.get_value(),
                color=RED,
                radius=0.12,
            )
        )

        circles = VGroup()
        num_waves = 8

        for i in range(num_waves):
            emit_time = i * 0.5
            circle = always_redraw(
                lambda et=emit_time: Circle(
                    radius=max(0, (tracker.get_value() - et) * 1.2),
                    color=BLUE,
                    stroke_width=2,
                ).move_to(RIGHT * source_speed * et)
                if tracker.get_value() > et
                else VMobject()
            )
            circles.add(circle)

        self.add(source, circles)
        self.play(tracker.animate.set_value(5), run_time=5, rate_func=linear)
```

---

## 电磁学动画

### 电场线

```python
class ElectricFieldLines(Scene):
    def construct(self):
        charges = VGroup(
            Dot(LEFT * 2, color=RED, radius=0.15),
            Dot(RIGHT * 2, color=BLUE, radius=0.15),
        )
        plus = MathTex("+", color=WHITE).move_to(charges[0])
        minus = MathTex("-", color=WHITE).move_to(charges[1])

        field_lines = VGroup()
        num_lines = 12
        for i in range(num_lines):
            angle = i * TAU / num_lines
            start = LEFT * 2 + 0.3 * np.array([np.cos(angle), np.sin(angle), 0])

            points = [start]
            pos = start.copy()
            for _ in range(100):
                r_plus = pos - LEFT * 2
                r_minus = pos - RIGHT * 2
                d_plus = max(np.linalg.norm(r_plus), 0.3)
                d_minus = max(np.linalg.norm(r_minus), 0.3)
                field = r_plus / d_plus ** 3 - r_minus / d_minus ** 3
                norm = np.linalg.norm(field)
                if norm < 0.01:
                    break
                pos = pos + field / norm * 0.1
                points.append(pos.copy())

            line = VMobject().set_points_as_corners(points).set_stroke(YELLOW, 1.5)
            field_lines.add(line)

        self.add(charges, plus, minus, field_lines)
        self.play(FadeIn(field_lines), run_time=2)
        self.wait()
```

### 磁场中的洛伦兹力

```python
class LorentzForce(Scene):
    def construct(self):
        axes = ThreeDAxes()
        self.set_camera_orientation(phi=75 * DEGREES, theta=-45 * DEGREES)

        B_field = Arrow(ORIGIN, OUT * 3, color=BLUE)
        B_label = MathTex(r"\vec{B}", color=BLUE).next_to(B_field, OUT)

        tracker = ValueTracker(0)
        q = 1
        B = 1
        m = 1
        omega = q * B / m
        radius = 1.5

        particle = always_redraw(
            lambda: Dot3D(
                radius * np.array([
                    np.cos(omega * tracker.get_value()),
                    np.sin(omega * tracker.get_value()),
                    0,
                ]),
                color=YELLOW,
            )
        )

        trail = always_redraw(
            lambda: VMobject().set_points_as_corners([
                radius * np.array([
                    np.cos(omega * t),
                    np.sin(omega * t),
                    0,
                ])
                for t in np.linspace(0, tracker.get_value(), 200)
            ]).set_stroke(YELLOW, 1)
        )

        self.add(axes, B_field, B_label, particle)
        self.play(tracker.animate.set_value(TAU), run_time=4, rate_func=linear)
```

---

## 热力学动画

### 理想气体等温过程

```python
class IsothermalProcess(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0.5, 5, 1],
            y_range=[0, 5, 1],
            x_length=7,
            y_length=5,
            axis_config={"include_tip": True},
        ).shift(DOWN * 0.5)
        labels = axes.get_axis_labels("V", "P")

        nR = 2
        T1, T2, T3 = 1, 2, 3

        isotherm1 = axes.plot(lambda V: nR * T1 / V, x_range=[0.5, 5], color=BLUE)
        isotherm2 = axes.plot(lambda V: nR * T2 / V, x_range=[0.5, 5], color=GREEN)
        isotherm3 = axes.plot(lambda V: nR * T3 / V, x_range=[0.5, 5], color=RED)

        t_labels = VGroup(
            MathTex(r"T_1").next_to(isotherm1, RIGHT),
            MathTex(r"T_2").next_to(isotherm2, RIGHT),
            MathTex(r"T_3").next_to(isotherm3, RIGHT),
        )

        title = Text("理想气体等温线").to_edge(UP)

        self.add(axes, labels, title)
        self.play(Create(isotherm1), Write(t_labels[0]))
        self.play(Create(isotherm2), Write(t_labels[1]))
        self.play(Create(isotherm3), Write(t_labels[2]))
        self.wait()
```

### 布朗运动

```python
class BrownianMotion(Scene):
    def construct(self):
        num_particles = 30
        particles = VGroup(
            *[
                Dot(ORIGIN + np.random.randn(3) * 0.1, radius=0.04, color=BLUE)
                for _ in range(num_particles)
            ]
        )

        tracker = ValueTracker(0)
        big_particle = Dot(ORIGIN, radius=0.15, color=RED)
        trail_points = [ORIGIN.copy()]

        big_particle.add_updater(
            lambda m: m.move_to(
                m.get_center() + np.random.randn(3) * 0.05
            )
        )

        self.add(particles, big_particle)
        for _ in range(5):
            for p in particles:
                p.shift(np.random.randn(3) * 0.08)
            self.wait(0.1)
```

---

## 光学动画

### 光的折射

```python
class LightRefraction(Scene):
    def construct(self):
        interface = Line(LEFT * 5, RIGHT * 5, color=WHITE)
        upper_label = MathTex(r"n_1").shift(UP * 1.5)
        lower_label = MathTex(r"n_2").shift(DOWN * 1.5)

        n1, n2 = 1.0, 1.5
        theta1 = 45 * DEGREES
        theta2 = np.arcsin(n1 * np.sin(theta1) / n2)

        incident = Arrow(
            UP * 3 + LEFT * 3 * np.tan(theta1),
            ORIGIN,
            color=YELLOW,
            buff=0,
        )
        refracted = Arrow(
            ORIGIN,
            DOWN * 3 + RIGHT * 3 * np.tan(theta2),
            color=ORANGE,
            buff=0,
        )
        reflected = Arrow(
            ORIGIN,
            UP * 3 + RIGHT * 3 * np.tan(theta1),
            color=YELLOW,
            buff=0,
            stroke_width=2,
        ).set_opacity(0.4)

        normal = DashedLine(DOWN * 3, UP * 3, color=GREY)

        angle_arc1 = Arc(radius=1, start_angle=PI / 2 - theta1, angle=theta1, color=GREEN)
        angle_arc2 = Arc(radius=1, start_angle=-PI / 2, angle=theta2, color=GREEN)

        theta1_label = MathTex(r"\theta_1").next_to(angle_arc1, UP)
        theta2_label = MathTex(r"\theta_2").next_to(angle_arc2, DOWN)

        snell = MathTex(r"n_1 \sin\theta_1 = n_2 \sin\theta_2").to_edge(UP)

        self.add(interface, normal, upper_label, lower_label, snell)
        self.play(GrowArrow(incident))
        self.play(GrowArrow(refracted), GrowArrow(reflected))
        self.play(
            Create(angle_arc1), Create(angle_arc2),
            Write(theta1_label), Write(theta2_label),
        )
        self.wait()
```

### 薄膜干涉

```python
class ThinFilmInterference(Scene):
    def construct(self):
        film = Rectangle(width=8, height=0.3, fill_color=BLUE, fill_opacity=0.3)
        film.shift(DOWN * 0.5)

        incident_ray = Arrow(UP * 2 + LEFT * 1, film.get_top() + LEFT * 1, color=YELLOW)
        reflected1 = Arrow(film.get_top() + LEFT * 1, UP * 2 + LEFT * 2, color=YELLOW)
        refracted1 = Arrow(film.get_top() + LEFT * 1, film.get_bottom() + LEFT * 0.5, color=ORANGE)
        reflected2 = Arrow(film.get_bottom() + LEFT * 0.5, film.get_top() + LEFT * 0.5, color=ORANGE)
        transmitted = Arrow(film.get_top() + LEFT * 0.5, UP * 2 + LEFT * 0, color=ORANGE)

        labels = VGroup(
            Text("入射光", font_size=24).next_to(incident_ray, LEFT),
            Text("反射光1", font_size=24).next_to(reflected1, LEFT),
            Text("反射光2", font_size=24).next_to(transmitted, RIGHT),
        )

        self.add(film)
        self.play(GrowArrow(incident_ray))
        self.play(GrowArrow(reflected1), GrowArrow(refracted1))
        self.play(GrowArrow(reflected2), GrowArrow(transmitted))
        self.play(Write(labels))
        self.wait()
```

---

## 通用物理工具

### 相位图绘制器

```python
def create_phase_portrait(axes, dx_dt, dy_dt, x_range, y_range, num_trajs=20, color=BLUE):
    trajectories = VGroup()
    for _ in range(num_trajs):
        x0 = np.random.uniform(*x_range)
        y0 = np.random.uniform(*y_range)
        points = [axes.c2p(x0, y0)]
        x, y = x0, y0
        dt = 0.02
        for _ in range(200):
            dx = dx_dt(x, y) * dt
            dy = dy_dt(x, y) * dt
            x += dx
            y += dy
            points.append(axes.c2p(x, y))
        traj = VMobject().set_points_as_corners(points).set_stroke(color, 1)
        trajectories.add(traj)
    return trajectories
```

### 向量场绘制器

```python
def create_vector_field(axes, field_func, x_samples=15, y_samples=10, color=BLUE):
    arrows = VGroup()
    x_vals = np.linspace(*axes.x_range[:2], x_samples)
    y_vals = np.linspace(*axes.y_range[:2], y_samples)
    for x in x_vals:
        for y in y_vals:
            fx, fy = field_func(x, y)
            magnitude = np.sqrt(fx ** 2 + fy ** 2)
            if magnitude > 0.01:
                start = axes.c2p(x, y)
                end = axes.c2p(x + fx / magnitude * 0.3, y + fy / magnitude * 0.3)
                arrow = Arrow(start, end, buff=0, color=color, stroke_width=1.5)
                arrows.add(arrow)
    return arrows
```

### 能量图绘制器

```python
def create_potential_energy_curve(axes, U_func, x_range, color=GREEN):
    curve = axes.plot(U_func, x_range=x_range, color=color)
    return curve
```
