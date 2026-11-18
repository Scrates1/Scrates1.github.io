---
title: "11｜对象、别名与指针分析：变量指向哪个对象？"
shortTitle: "11 对象、别名与指针分析"
order: 11
date: 2026-09-30
category:
  - 静态分析
tag:
  - 指针分析
  - 别名
  - 调用图
---

[第 06 篇](06-calls-and-context.md)的 `b=a; a.f=input(); sink(b.f);` 经一个变量写字段，再经另一个变量读出。要追踪这条传播，先要判断：**a 和 b 是否可能指向同一个对象？**

<!-- more -->

## 1. 局部变量事实为什么看不到这条传播

把第 06 篇的例子写完整，`Holder` 只有一个字段 f：

```java
Holder a = new Holder();   // 分配点 o1
Holder b = a;
a.f = input();
sink(b.f);
```

按[第 03 篇](03-dataflow-and-lattice.md)的局部变量污点模型，事实是“某个局部变量可能有污点”（若已读[第 07 篇](07-ifds.md)，同一限制也约束 IFDS 事实域）。逐句看：

1. `a = new Holder()` 不产生污点事实。
2. `b = a` 复制 a 的事实，a 没有污点，b 也没有。
3. `a.f = input()` 的左边是字段，不是局部变量，事实域里没有位置能记下它。
4. `sink(b.f)` 读的是字段，同样没有事实可查。

若直接忽略无法表示的字段操作，sink 处就会得到空集合，漏掉真实传播；第 04 篇的配套实现选择遇到超出模型的语句时报错。要让写 `a.f` 影响读 `b.f`，需要计算它们可能引用哪些对象。这就是**指针分析（pointer analysis）**，Java 语境下也叫**指向分析（points-to analysis）**。

## 2. 对象怎样抽象：分配点

同一处 `new Holder()` 每执行一次就创建一个对象，分析无法为每次分配逐一编号。**堆抽象（heap abstraction）**用有限记号概括这些对象；**分配点（allocation site）抽象**按每处 `new` 编号为 `oᵢ`，代表它在所有执行中创建的对象。

这相当于按“出生地”归类：本例的 `new Holder()` 记为 o1，`input()` 内部的 `new String(...)` 记为 s。

在这个抽象上，分析为每个引用变量 x 维护一个**指向集合（points-to set）** `pts(x)`：x 在某次执行的某个时刻可能引用的抽象对象的集合。抽象对象的字段也是一个可以指向别处的位置，写作 `oᵢ.f`，同样有 `pts(oᵢ.f)`。两个变量 x、y 的指向集合有交集，就说它们**可能别名（may alias）**。

本例的 `pts(a)`、`pts(b)` 都含 o1。下文用 `pts(x.f)` 简写经 x 读字段 f 的结果，即对所有 `o∈pts(x)` 的 `pts(o.f)` 取并集。

`pts(x)` 是[第 01 篇](01-goals-and-abstraction.md)意义上的过近似：真实执行中 x 引用的每个对象，其分配点都必须在 `pts(x)` 里；集合里多出不可能的分配点会损失精度，少一个就是不可靠。

## 3. Andersen 式规则：四条语句与包含约束

本篇用四种基本形态表示对象分配、引用复制和字段读写。下表采用 **Andersen 式**或**基于包含（inclusion-based）**的约束，源自 [Andersen 1994 年博士论文](https://www.cs.cornell.edu/courses/cs711/2005fa/papers/andersen-thesis94.pdf)：

| 语句 | 名称 | 约束 | 读法 |
| :--- | :--- | :--- | :--- |
| `x = new T()`（分配点 oᵢ） | new | `oᵢ ∈ pts(x)` | x 至少指向 oᵢ |
| `x = y` | copy | `pts(y) ⊆ pts(x)` | y 能指向的，x 都能指向 |
| `x.f = y` | store | 对每个 `o ∈ pts(x)`：`pts(y) ⊆ pts(o.f)` | 写进 x 所指每个对象的 f 字段 |
| `y = x.f` | load | 对每个 `o ∈ pts(x)`：`pts(o.f) ⊆ pts(y)` | 从 x 所指每个对象的 f 字段读出 |

new 提供初始对象，copy 传播集合，store/load 则通过接收者的指向集合找到字段位置。求解只增加对象，直到所有包含约束都满足。

这套规则**流不敏感（flow-insensitive）**：忽略语句顺序，用一份解满足全部约束，省去逐程序点保存堆状态的成本。代价是 `a = new A(); a.f = x; a = new B();` 中两次赋值会合流，x 也被写入 B 对应的抽象字段。[第 03 篇](03-dataflow-and-lattice.md)的污点分析仍可保持流敏感，并使用这份指向结果。

store/load 依赖 `pts(x)`，因此每当接收者新增对象，都要补上相应的字段传播边。

### 3.1 手算别名例子

把第 1 节的程序改写成六条语句，`t1`、`t2` 是编译器引入的临时变量。S1、S2、S4、S5 对应四种基本形态；S3 是调用，按模型当作返回分配点 s 的 new；S6 也是调用，但不改变任何引用：

```text
S1: a = new Holder()     // o1
S2: b = a
S3: t1 = input()         // 模型：返回分配点 s 的对象
S4: a.f = t1
S5: t2 = b.f
S6: sink(t2)
```

求解按工作列表进行：new 语句给出初始集合，指向集合发生变化的变量进入列表；取出一个变量时，沿它的 copy 边传播，并为它新指向的每个对象接上 store/load 边。

| 步骤 | 取出 | 本次计算 | 新增结果 | 工作列表 |
| :--- | :--- | :--- | :--- | :--- |
| 0 | — | S1、S3 的 new | `pts(a)={o1}`，`pts(t1)={s}` | `[a, t1]` |
| 1 | a | S2 copy：`pts(a)⊆pts(b)`；S4 store：a 指向 o1，接上 `pts(t1)⊆pts(o1.f)` | `pts(b)={o1}`，`pts(o1.f)={s}` | `[t1, b, o1.f]` |
| 2 | t1 | 边 `t1→o1.f` 已传播 | 无 | `[b, o1.f]` |
| 3 | b | S5 load：b 指向 o1，接上 `pts(o1.f)⊆pts(t2)` | `pts(t2)={s}` | `[o1.f, t2]` |
| 4 | o1.f | 边 `o1.f→t2` 已传播 | 无 | `[t2]` |
| 5 | t2 | 没有出边 | 无 | `[]` |

`pts(t2)={s}` 表示 sink 可能收到 `input()` 创建的字符串对象。若另有“s 带污点”的来源模型，就能报告这条传播；指针分析本身只负责对象关系。

![别名例子的指向图：a、b 都指向 o1，o1.f 指向 s，读出到 t2](assets/11-series-1.svg#light)

![别名例子的指向图：a、b 都指向 o1，o1.f 指向 s，读出到 t2](assets/11-series-1.dark.svg#dark)

[查看可编辑图源](https://github.com/Scrates1/Scrates1.github.io/blob/main/src/static-analysis/assets/11-series-1.mmd)

图中粗箭头表示“指向”，虚线箭头表示语句建立的包含关系，o1 与 o1.f 之间的细线表示字段从属；store 和 load 的虚线是在步骤 1、3 才接上的。

### 3.2 对照：两个分配点

把 `b = a` 换成 `b = new Holder()`（o2）。此时 `pts(a)={o1}`、`pts(b)={o2}`；S4 写入 `o1.f`，S5 却从没有被写过的 `o2.f` 读取，得到 `pts(t2)=∅`，不产生污点报告。本例的指向集合不记录 null；真实执行中 `b.f` 正是 null。

### 3.3 跨方法：参数与返回也是 copy

已知目标的调用 `r = m(y)` 可用 copy 连接实参与形参、返回值与接收变量：`pts(y) ⊆ pts(m.p)`、`pts(m.ret) ⊆ pts(r)`，其中 `m.ret` 汇集所有返回值。第 7 节用 `b = same(a)`、`Holder same(Holder h) { return h; }` 替换 S2，形成 `pts(a) ⊆ pts(h) ⊆ pts(same.ret) ⊆ pts(b)`，仍得到 `pts(b)={o1}`。

虚调用 `r = x.m(y)` 先根据 `pts(x)` 中对象 o 的类型解析目标 m'，再建立参数与返回 copy，并把 o 加入 `pts(m'.this)`。目标与指向集合可在求解中交替扩展，称为 **on-the-fly 调用图**构建；Spark 默认采用这种方式，发现新接收者对象时就补充调用边。

### 3.4 算法骨架与成本

```text
传播(s, t)：if pts(s) ⊄ pts(t)：pts(t) ∪= pts(s)，t 入工作列表     // ⊄ 读“不是子集”，∪= 读“并入”
加边(s, t)：记录 s→t，随即 传播(s, t)

初始化：对每条 copy 语句 x = y，只记录边 y→x
       对每条 new 语句 x = new T()（oᵢ），pts(x) ∪= {oᵢ}，x 入工作列表
while 工作列表非空:
    取出节点 v（变量或 oᵢ.f）
    for 每条已有的边 v→w:
        传播(v, w)
    for 每条以 v 为接收者的 store 语句 v.f = y、每个新到达的 o ∈ pts(v):
        加边(y, o.f)
    for 每条以 v 为来源的 load 语句 y = v.f、每个新到达的 o ∈ pts(v):
        加边(o.f, y)
```

第 3.1 节表格中的每一行都对应循环体的一次执行：步骤 1 先沿已有的 copy 边把 o1 传给 b，再为 store 接上 `t1→o1.f`，新边随即传播，所以 `pts(o1.f)` 在同一步得到 s，工作列表按这个顺序排成 `[t1, b, o1.f]`。集合只增不减且元素来自有限的分配点集合，所以迭代必然停止，这是[第 04 篇](04-worklist-and-fixed-point.md)有限高度条件的又一次应用。

伪代码每次沿边重传整个集合；实现可只传新增对象，称为**差分传播（difference propagation）**。设 N 是变量、分配点及字段位置的总数，差分传播的最坏时间为 `O(N³)`：最多 `N²` 条边，每个对象沿每条边至多传播一次，每条边至多传 N 个对象。Spark 用位向量等集合表示降低常数开销。

另一条路线是 Steensgaard 的**基于等价（equality-based）**规则：将 `x = y` 两端合并为一个节点，令其指向信息相等，以更粗的结果换取接近线性的求解时间。

## 4. 上下文不敏感的合流

上面的规则对每个方法只保留一份变量集合，同一个方法被两处调用，两处的信息合在一起。看这个工厂方法：

```java
static Holder make() { return new Holder(); }   // 分配点 o3

Holder h1 = make();      // 调用点 A
Holder h2 = make();      // 调用点 B
h1.f = input();
sink(h2.f);
```

真实执行中 h1 和 h2 是两个不同对象，`h2.f` 从未被写过。按第 3 节规则手算：make 里的 new 直接作为返回值，`o3 ∈ pts(make.ret)`；两条返回 copy 给出 `pts(h1)={o3}`、`pts(h2)={o3}`；store 把 s 写进 `o3.f`；load 从 `o3.f` 读出，`pts(h2.f)={s}`。分析报告 sink 收到外部输入，这是一条误报。

o3 合并了 A、B 各自创建的对象，字段共用 `pts(o3.f)`，于是产生假别名。工厂方法、构造器包装和集合类内部的分配点都可能出现这种合流。

## 5. 上下文敏感保留什么区别

**上下文敏感（context-sensitive）**指针分析为同一个方法在不同“上下文”下分别保存一份变量集合，[第 06 篇](06-calls-and-context.md)第 5 节把它列为三种敏感性之一。上下文取什么，决定了能分开哪些情况。

**调用点敏感（call-site sensitivity）**用最近 k 层调用点作上下文，文献也称 k-CFA（k-level control-flow analysis），下文写作“k-调用点”。k=1 时，make 分为 `make[A]`、`make[B]` 两份；但若堆抽象不变，两份中的 new 仍是 o3，`pts(h1)=pts(h2)={o3}`，误报照旧。

还需让对象带上上下文，即**上下文敏感堆（context-sensitive heap，也叫 heap cloning）**：`pts(h1)={o3[A]}`、`pts(h2)={o3[B]}`。store 只写 `o3[A].f`，load 读 `o3[B].f` 得到空集，误报消失。只分开方法状态，无法分开共用的抽象对象。

![工厂例子：上下文不敏感时 h1、h2 共享 o3；调用点上下文加到堆上后分成 o3[A]、o3[B]](assets/11-series-2.svg#light)

![工厂例子：上下文不敏感时 h1、h2 共享 o3；调用点上下文加到堆上后分成 o3[A]、o3[B]](assets/11-series-2.dark.svg#dark)

[查看可编辑图源](https://github.com/Scrates1/Scrates1.github.io/blob/main/src/static-analysis/assets/11-series-2.mmd)

**对象敏感（object sensitivity）**按“替哪个对象执行”区分上下文，用接收者对象的分配点作标识，由 [Milanova、Rountev 与 Ryder](https://www.cs.rpi.edu/~milanova/docs/tosem05.pdf) 提出：

```java
class Holder {
    String f;
    void set(String v)  { this.f = v; }
    void init(String v) { this.set(v); }   // set 的调用点只有这一处，记为 E
}
Holder p = new Holder();   // o4
Holder q = new Holder();   // o5
p.set(input());            // 调用点 C
q.set("safe");             // 调用点 D
sink(q.f);
```

先只看 C、D 两处直接调用。上下文不敏感时 set 只有一份：`pts(this)={o4,o5}`，`pts(v)={s, c}`（c 是常量字符串），store 把 `{s,c}` 同时写进 `o4.f` 和 `o5.f`，`sink(q.f)` 误报。对象敏感把 set 分成 `set[o4]`、`set[o5]`，前者 `this={o4}`、`v={s}`，后者 `this={o5}`、`v={c}`，`o5.f` 只有 c。1-调用点在这个例子里同样有效，因为 C、D 是两个不同的调用点。

把两处直接调用换成 `p.init(input()); q.init("safe");`，区别就出来了。set 现在只有一个调用点 E，1-调用点下 set 只有 `set[E]` 一份，`this={o4,o5}`、`v={s,c}` 又合流，要 k=2 才能区分“经 C 到 E”与“经 D 到 E”。对象敏感则不看调用点：`init[o4]` 里 `this.set(v)` 的接收者是 o4，进入 `set[o4]`；`init[o5]` 进入 `set[o5]`，`o5.f` 仍只有 c。

对象敏感也有分不开的情况。静态方法没有接收者，对象敏感通常让它沿用调用者的上下文。第 4 节的两次 `make()` 来自同一个调用者，上下文相同，`make` 只有一份，仍然合流；同理，若上面的转发写成静态方法 `fill(h, v) { h.set(v); }`，两次 `fill` 也只有一份，`pts(v)={s,c}` 在 fill 的形参上已经合流，再按接收者拆开 set 也无济于事。这类情况要靠调用点上下文，实际框架常把两者混合——虚调用用对象上下文，静态调用用调用点上下文，称为**混合上下文敏感（hybrid context-sensitivity）**，见 [Kastrinis 与 Smaragdakis 的论文](https://yanniss.github.io/hybrid-context-pldi13.pdf)。

| 上下文 | 分开的是什么 | 第 4 节工厂例子 | 直接调用 set | 经 init 转发的 set |
| :--- | :--- | :--- | :--- | :--- |
| 不敏感 | — | 误报 | 误报 | 误报 |
| 1-调用点，堆不敏感 | 最近一层调用位置 | 误报（o3 仍共享） | 正确 | 误报（k=2 才正确） |
| 1-调用点 + 上下文敏感堆 | 调用位置及其创建的对象 | 正确 | 正确 | 误报（k=2 才正确） |
| 1-对象敏感 + 上下文敏感堆 | 接收者对象 | 误报（静态方法沿用调用者上下文） | 正确 | 正确 |

表中结论按第 3 节规则加上下文后手算，未用工具验证——Spark 本身是上下文不敏感的。

[Smaragdakis 与 Balatsouras 的教程](https://yanniss.github.io/points-to-tutorial15.pdf)总结了对象敏感在面向对象程序中的精度优势，Doop 将其作为主要配置之一。上下文随 k 增大可能迅速增长，实践常取 1 或 2，堆的深度可比方法低一层。区分更多上下文也会扩大第 3.4 节的约束图。

## 6. 用指向结果精化调用图

现在计算[第 06 篇](06-calls-and-context.md)的虚调用目标。对象改由声明返回 Reader 的 `open()` 取得，以保留 Soot 中用于 CHA 对照的接口类型，详见第 7 节：

```java
interface Reader { String read(); }
class FileReader implements Reader { public String read() { return "file"; } }
class NetReader  implements Reader { public String read() { return input(); } }

Reader open() { return new FileReader(); }   // 分配点 o6
Reader service = open();
sink(service.read());
```

CHA 看声明类型 Reader，目标是 `{FileReader.read, NetReader.read}`；NetReader.read 返回外部输入，sink 得到一条候选路径。指针分析给出 `pts(service)={o6}`，o6 的类型是 FileReader，按第 3.3 节的虚调用规则，目标只有 `FileReader.read`，那条候选路径不存在。

本例的 **RTA** 也只有一个目标，因为 NetReader 从未被实例化。指向分析的优势要在两个实现都实例化、但仅一个流到当前调用点时才显现。减少调用目标也会减少后续 IFDS 的程序边和相关事实。

## 7. 用 Soot 的 Spark 核对

[配套工程](https://github.com/Scrates1/Scrates1.github.io/blob/main/examples/static-analysis/README.md)的 `PointsToCases` 把第 3.1、3.2、4、6 节的四个例子写成四个方法（第 5 节的 set 例子需要上下文敏感，不在其中），`PointsToInspect` 用 Soot 4.7.1 的 Spark 做整程序指向分析，打印每个引用变量的指向集合、Holder 字段的内容，以及 `service.read()` 在 CHA 与 Spark 下的目标。Spark 是流不敏感、**字段敏感（field-sensitive，区分同一对象的不同字段）**、上下文不敏感的 Andersen 式实现，默认在求解中同步构建调用图，设计见 [Lhoták 与 Hendren 的论文](https://plg.uwaterloo.ca/~olhotak/pubs/cc03.pdf)。实际输出见 [expected/points-to.txt](https://github.com/Scrates1/Scrates1.github.io/blob/main/examples/static-analysis/expected/points-to.txt)，节选：

```text
alias | pts(a) = [new Holder @ alias:42]
alias | pts(b) = [new Holder @ alias:42]
alias | pts(b.f) = [new String @ input:27]
separate | pts(a) = [new Holder @ separate:50]
separate | pts(b) = [new Holder @ separate:51]
separate | pts(b.f) = []
factory | pts(h1) = [new Holder @ make:57]
factory | pts(h2) = [new Holder @ make:57]
factory | pts(h2.f) = [new String @ input:27]
dispatch | pts(service) = [new FileReader @ open:70]
CHA on declared type Reader = [FileReader.read, NetReader.read]
Spark call graph edges      = [FileReader.read]
```

标签 `new Holder @ alias:42` 就是分配点：类型加源码位置。对照手算：`alias` 中 a、b 共享一个分配点，`b.f` 里是 `input()` 创建的字符串对象；`separate` 中 `b.f` 为空；`factory` 中 h1、h2 共享 `make:57`，`h2.f` 被写入——与第 4 节预测的误报一致，直接运行程序时这一句打印的是 `null`。`dispatch` 中 CHA 两个目标、Spark 一个目标。

示例有两处写法用于适应 Soot 的 IR 处理：

- 示例用 `b = same(a)` 而不是 `b = a`。Soot 的 `jb` 阶段默认做拷贝传播，会把同一方法内的 `b = a` 直接替换成 a，分析开始前变量 b 已经不存在。经过方法的 copy 不会被折叠，且第 3.3 节已说明它与直接 copy 等价。
- `service` 由声明返回 `Reader` 的 `open()` 取得。若写成 `Reader service = new FileReader()`，Soot 的类型推断会把 service 的 Jimple 类型收紧为 FileReader，CHA 在这个局部变量上也只剩一个目标，对照就失去意义。

`separate` 的 Jimple 中，`input()` 返回值和 `b.f` 的读出共用临时变量 `$stack4`。流不敏感的 `pts($stack4)` 因而含 s，不能用它区分这两次赋值。示例直接查询 `pts(b.f)`；若要查询临时变量，应先拆分不同定义，避免这类合流。

字符串常量在 Spark 里默认合并成一个节点，所以示例让 `input()` 用 `new String(...)` 产生独立分配点；库类被排除、不加载方法体，库内部的分配和调用不在结果里。

## 8. 哪些是模型选择

以下模型选择共同影响精度与成本：

| 选择 | 常见做法 | 影响 |
| :--- | :--- | :--- |
| 堆抽象 | 按分配点；更粗的按类型；更细的加上下文 | 第 4—5 节的假别名来自这里 |
| 上下文与深度 k | 不敏感、k-调用点、k-对象；堆可用 k−1 | 深度增加可能使上下文数量迅速增长 |
| 字段 | 字段敏感：区分 `o.f` 与 `o.g`；字段不敏感（field-insensitive）：一个对象一个集合；基于字段（field-based）：按字段名而不分对象 | Spark 默认字段敏感，可切换为基于字段以换取速度 |
| 数组 | 所有下标合成一个特殊字段 `o.[]` | `a[0]` 与 `a[1]` 不区分 |
| 静态字段 | 一个全局节点 `C.f` | 所有写入合流 |
| 字符串与常量 | 常量合并为一个节点，或每个常量一个节点 | 影响以字符串为对象的分析 |
| 库与无方法体的调用 | 排除并视为空操作、手写摘要或整库分析 | 排除会漏掉库内部建立的别名 |

不同配置会改变 `pts` 和调用图。反射、动态代理与原生代码的覆盖缺口留待后续专题讨论。

**按需求解（demand-driven）**从查询点出发，只计算相关的别名信息，代表工具是面向 Java 的 Boomerang。当 x、y 可能别名时，`x.f=v` 与 `w=y.f` 可将 v 传给 w；查询既要匹配字段，也要匹配调用返回。两类括号各自精确匹配的一般问题不可判定，实际工具需要近似或限制模型；展开见[第 07 篇选读第 6.3 节](07-ifds.md)。它与 IFDS 污点分析的配合留待下一篇。

## 本篇要点

- **分配点抽象**用每处 new 概括对象，指向集合相交表示可能别名。
- **Andersen 式约束**传播 new、copy、store、load；本例流不敏感，字段边随指向集合增长而补充。
- 区分工厂返回对象还需**上下文敏感堆**；对象敏感适合按接收者分开状态，但不能消除所有合流。
- 接收者的指向集合可精化虚调用目标；Spark 核对了别名、分离对象、工厂合流与派发四个例子。
- 堆、上下文、字段和库模型共同决定结果的精度与覆盖。

下一篇把 IFDS 的事实域从局部变量扩展到访问路径，并加入净化与库模型（规划中）。

[上一篇：10 IDE 求解器工程优化](10-ide-solver-engineering.md) · 下一篇：12 污点分析实践（规划中） · [返回系列总览](README.md)
