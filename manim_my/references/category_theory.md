# 范畴论动画模板

参考 ManimCat 项目的设计理念，为范畴论概念提供可视化动画模板。

## 目录
1. [基础范畴图](#基础范畴图)
2. [函子动画](#函子动画)
3. [自然变换动画](#自然变换动画)
4. [极限与余极限](#极限与余极限)
5. [通用范畴论工具](#通用范畴论工具)

---

## 基础范畴图

### 对象与态射

```python
class CategoryBasics(Scene):
    def construct(self):
        A = Dot(LEFT * 3, radius=0.1).set_color(BLUE)
        B = Dot(RIGHT * 3, radius=0.1).set_color(BLUE)
        A_label = MathTex("A", color=BLUE).next_to(A, DOWN)
        B_label = MathTex("B", color=BLUE).next_to(B, DOWN)

        f = Arrow(A, B, color=YELLOW, buff=0.15)
        f_label = MathTex("f", color=YELLOW).next_to(f, UP)

        self.add(A, B, A_label, B_label)
        self.play(GrowArrow(f), Write(f_label))
        self.wait()
```

### 交换图

```python
class CommutativeDiagram(Scene):
    def construct(self):
        A = MathTex("A").shift(LEFT * 3 + UP * 2)
        B = MathTex("B").shift(RIGHT * 3 + UP * 2)
        C = MathTex("C").shift(LEFT * 3 + DOWN * 2)
        D = MathTex("D").shift(RIGHT * 3 + DOWN * 2)

        f = Arrow(A.get_bottom(), B.get_bottom(), color=YELLOW, buff=0.15)
        f_label = MathTex("f", color=YELLOW).next_to(f, UP, buff=0.2)

        g = Arrow(A.get_right(), C.get_right(), color=GREEN, buff=0.15)
        g_label = MathTex("g", color=GREEN).next_to(g, LEFT, buff=0.2)

        h = Arrow(B.get_right(), D.get_right(), color=ORANGE, buff=0.15)
        h_label = MathTex("h", color=ORANGE).next_to(h, RIGHT, buff=0.2)

        k = Arrow(C.get_bottom(), D.get_bottom(), color=RED, buff=0.15)
        k_label = MathTex("k", color=RED).next_to(k, DOWN, buff=0.2)

        objects = VGroup(A, B, C, D)
        morphisms = VGroup(f, g, h, k)
        labels = VGroup(f_label, g_label, h_label, k_label)

        self.add(objects)
        self.play(GrowArrow(f), Write(f_label))
        self.play(GrowArrow(g), Write(g_label))
        self.play(GrowArrow(h), Write(h_label))
        self.play(GrowArrow(k), Write(k_label))

        eq = MathTex(r"h \circ f = k \circ g").to_edge(UP)
        self.play(Write(eq))
        self.wait()
```

### 态射组合

```python
class MorphismComposition(Scene):
    def construct(self):
        A = MathTex("A").shift(LEFT * 4)
        B = MathTex("B").shift(ORIGIN)
        C = MathTex("C").shift(RIGHT * 4)

        f = Arrow(A.get_right(), B.get_left(), color=YELLOW, buff=0.15)
        f_label = MathTex("f", color=YELLOW).next_to(f, UP)

        g = Arrow(B.get_right(), C.get_left(), color=GREEN, buff=0.15)
        g_label = MathTex("g", color=GREEN).next_to(g, UP)

        gf = CurvedArrow(A.get_bottom(), C.get_bottom(), color=RED, angle=-TAU / 4)
        gf_label = MathTex(r"g \circ f", color=RED).next_to(gf, DOWN)

        self.add(A, B, C)
        self.play(GrowArrow(f), Write(f_label))
        self.play(GrowArrow(g), Write(g_label))
        self.play(Create(gf), Write(gf_label))
        self.wait()
```

### 恒等态射

```python
class IdentityMorphism(Scene):
    def construct(self):
        A = MathTex("A").shift(LEFT * 2)
        B = MathTex("B").shift(RIGHT * 2)

        f = Arrow(A.get_right(), B.get_left(), color=YELLOW, buff=0.15)
        f_label = MathTex("f", color=YELLOW).next_to(f, UP)

        id_A = CurvedArrow(
            A.get_top() + UP * 0.3,
            A.get_top() + UP * 0.3 + RIGHT * 0.01,
            color=BLUE,
            angle=TAU / 3,
            tip_length=0.15,
        )
        id_A_label = MathTex(r"id_A", color=BLUE, font_size=30).next_to(id_A, UP, buff=0.2)

        self.add(A, B)
        self.play(Create(id_A), Write(id_A_label))
        self.play(GrowArrow(f), Write(f_label))
        self.wait()
```

---

## 函子动画

### 函子映射对象和态射

```python
class FunctorMapping(Scene):
    def construct(self):
        source_title = Text("范畴 C", font_size=28).shift(LEFT * 4 + UP * 3)
        target_title = Text("范畴 D", font_size=28).shift(RIGHT * 4 + UP * 3)

        A = MathTex("A").shift(LEFT * 5 + UP * 1)
        B = MathTex("B").shift(LEFT * 3 + DOWN * 1)
        f = Arrow(A.get_bottom(), B.get_top(), color=YELLOW, buff=0.15)
        f_label = MathTex("f", color=YELLOW, font_size=30).next_to(f, LEFT, buff=0.1)

        FA = MathTex("F(A)").shift(RIGHT * 3 + UP * 1)
        FB = MathTex("F(B)").shift(RIGHT * 5 + DOWN * 1)
        Ff = Arrow(FA.get_bottom(), FB.get_top(), color=GREEN, buff=0.15)
        Ff_label = MathTex("F(f)", color=GREEN, font_size=30).next_to(Ff, RIGHT, buff=0.1)

        functor_arrow = CurvedArrow(
            LEFT * 1 + UP * 0.5,
            RIGHT * 1 + UP * 0.5,
            color=RED,
            angle=-TAU / 6,
            tip_length=0.2,
        )
        functor_label = MathTex("F", color=RED, font_size=36).next_to(functor_arrow, UP, buff=0.2)

        self.add(source_title, target_title)
        self.play(FadeIn(A), FadeIn(B), GrowArrow(f), Write(f_label))
        self.play(Create(functor_arrow), Write(functor_label))
        self.play(
            TransformFromCopy(A, FA),
            TransformFromCopy(B, FB),
            TransformFromCopy(f, Ff),
            Write(Ff_label),
        )
        self.wait()
```

### 函子保持组合

```python
class FunctorPreservesComposition(Scene):
    def construct(self):
        left_half = VGroup()
        A = MathTex("A").shift(LEFT * 5 + UP * 2)
        B = MathTex("B").shift(LEFT * 5)
        C = MathTex("C").shift(LEFT * 5 + DOWN * 2)
        f = Arrow(A, B, color=YELLOW, buff=0.15)
        g = Arrow(B, C, color=GREEN, buff=0.15)
        gf = CurvedArrow(A.get_right(), C.get_right(), color=RED, angle=-TAU / 6)

        left_half.add(A, B, C, f, g, gf)

        right_half = VGroup()
        FA = MathTex("F(A)").shift(RIGHT * 3 + UP * 2)
        FB = MathTex("F(B)").shift(RIGHT * 3)
        FC = MathTex("F(C)").shift(RIGHT * 3 + DOWN * 2)
        Ff = Arrow(FA, FB, color=YELLOW, buff=0.15)
        Fg = Arrow(FB, FC, color=GREEN, buff=0.15)
        Fgf = CurvedArrow(FA.get_right(), FC.get_right(), color=RED, angle=-TAU / 6)

        right_half.add(FA, FB, FC, Ff, Fg, Fgf)

        eq = MathTex(r"F(g \circ f) = F(g) \circ F(f)").shift(UP * 3.5)

        self.play(FadeIn(left_half))
        self.play(FadeIn(right_half))
        self.play(Write(eq))
        self.wait()
```

---

## 自然变换动画

### 自然变换的可视化

```python
class NaturalTransformation(Scene):
    def construct(self):
        FA = MathTex("F(A)").shift(LEFT * 3 + UP * 2)
        FB = MathTex("F(B)").shift(RIGHT * 3 + UP * 2)
        GA = MathTex("G(A)").shift(LEFT * 3 + DOWN * 2)
        GB = MathTex("G(B)").shift(RIGHT * 3 + DOWN * 2)

        Ff = Arrow(FA.get_bottom(), FB.get_bottom(), color=YELLOW, buff=0.15)
        Gf = Arrow(GA.get_bottom(), GB.get_bottom(), color=GREEN, buff=0.15)

        eta_A = Arrow(FA.get_right(), GA.get_right(), color=RED, buff=0.15)
        eta_B = Arrow(FB.get_right(), GB.get_right(), color=RED, buff=0.15)

        eta_A_label = MathTex(r"\eta_A", color=RED, font_size=28).next_to(eta_A, LEFT, buff=0.15)
        eta_B_label = MathTex(r"\eta_B", color=RED, font_size=28).next_to(eta_B, RIGHT, buff=0.15)

        nat_cond = MathTex(r"G(f) \circ \eta_A = \eta_B \circ F(f)").to_edge(UP)

        self.add(FA, FB, GA, GB)
        self.play(GrowArrow(Ff), GrowArrow(Gf))
        self.play(GrowArrow(eta_A), Write(eta_A_label))
        self.play(GrowArrow(eta_B), Write(eta_B_label))
        self.play(Write(nat_cond))
        self.wait()
```

---

## 极限与余极限

### 拉回 (Pullback)

```python
class Pullback(Scene):
    def construct(self):
        P = MathTex("P").shift(LEFT * 2 + UP * 2)
        X = MathTex("X").shift(RIGHT * 2 + UP * 2)
        Y = MathTex("Y").shift(LEFT * 2 + DOWN * 2)
        Z = MathTex("Z").shift(RIGHT * 2 + DOWN * 2)

        p1 = Arrow(P.get_bottom(), X.get_bottom(), color=YELLOW, buff=0.15)
        p2 = Arrow(P.get_right(), Y.get_right(), color=GREEN, buff=0.15)
        f = Arrow(X.get_right(), Z.get_right(), color=ORANGE, buff=0.15)
        g = Arrow(Y.get_bottom(), Z.get_bottom(), color=RED, buff=0.15)

        p1_label = MathTex("p_1", color=YELLOW, font_size=24).next_to(p1, UP, buff=0.1)
        p2_label = MathTex("p_2", color=GREEN, font_size=24).next_to(p2, LEFT, buff=0.1)
        f_label = MathTex("f", color=ORANGE, font_size=24).next_to(f, RIGHT, buff=0.1)
        g_label = MathTex("g", color=RED, font_size=24).next_to(g, DOWN, buff=0.1)

        condition = MathTex(r"f \circ p_1 = g \circ p_2").to_edge(UP)

        self.add(P, X, Y, Z)
        self.play(GrowArrow(f), GrowArrow(g), Write(f_label), Write(g_label))
        self.play(GrowArrow(p1), GrowArrow(p2), Write(p1_label), Write(p2_label))
        self.play(Write(condition))
        self.wait()
```

### 积 (Product)

```python
class ProductDiagram(Scene):
    def construct(self):
        P = MathTex(r"A \times B").shift(UP * 2)
        A = MathTex("A").shift(LEFT * 3 + DOWN * 2)
        B = MathTex("B").shift(RIGHT * 3 + DOWN * 2)

        pi1 = Arrow(P.get_bottom(), A.get_top(), color=YELLOW, buff=0.15)
        pi2 = Arrow(P.get_bottom(), B.get_top(), color=GREEN, buff=0.15)

        pi1_label = MathTex(r"\pi_1", color=YELLOW, font_size=28).next_to(pi1, LEFT, buff=0.15)
        pi2_label = MathTex(r"\pi_2", color=GREEN, font_size=28).next_to(pi2, RIGHT, buff=0.15)

        universal = MathTex(
            r"\forall f: X \to A, g: X \to B, \exists! \langle f, g \rangle"
        ).to_edge(UP)

        self.add(P, A, B)
        self.play(GrowArrow(pi1), Write(pi1_label))
        self.play(GrowArrow(pi2), Write(pi2_label))
        self.play(Write(universal))
        self.wait()
```

---

## 通用范畴论工具

### 交换图绘制器

```python
def create_commutative_diagram(objects, morphisms, positions=None):
    """
    objects: dict of {name: MathTex}
    morphisms: list of (source_name, target_name, label, color)
    positions: dict of {name: np.array} for custom positioning
    """
    diagram = VGroup()

    if positions:
        for name, pos in positions.items():
            objects[name].move_to(pos)

    for name, obj in objects.items():
        diagram.add(obj)

    for src_name, tgt_name, label, color in morphisms:
        src = objects[src_name]
        tgt = objects[tgt_name]
        arrow = Arrow(src, tgt, color=color, buff=0.15)
        label_mob = MathTex(label, color=color, font_size=28).next_to(arrow, UP, buff=0.15)
        diagram.add(arrow, label_mob)

    return diagram
```

### 态射动画器

```python
def animate_morphism(source, target, color=YELLOW, label=None, label_position=UP):
    arrow = Arrow(source, target, color=color, buff=0.15)
    animations = [GrowArrow(arrow)]
    if label:
        label_mob = MathTex(label, color=color, font_size=28).next_to(arrow, label_position, buff=0.15)
        animations.append(Write(label_mob))
    return animations, arrow
```

### 范畴对象绘制器

```python
def create_category_object(name, position, color=BLUE, radius=0.08):
    dot = Dot(position, radius=radius, color=color)
    label = MathTex(name, color=color, font_size=32).next_to(dot, DOWN, buff=0.3)
    return VGroup(dot, label)
```
