---
title: "06｜跨过函数调用：信息从哪里进去，回到哪里？"
shortTitle: "06 调用关系与上下文"
order: 6
date: 2026-09-25
category:
  - 静态分析
tag:
  - 调用图
  - ICFG
  - 上下文敏感
---

同一个方法接受不同实参，可能产生不同结果。**过程间分析（interprocedural analysis）**——跨过方法边界的分析——需要将调用者的实参映射到形参，再把返回值送回相应的调用位置。

<!-- more -->

## 1. 一个方法，两次调用

```java
static int plusTwo(int p) { return p + 2; }
int b = plusTwo(1);   // A：返回 3
int c = plusTwo(4);   // B：返回 6
```

若在入口把 p 的两个值合成未知，A、B 也只能得到未知。要保留区别，就需要区分**调用上下文**。

污点传播也有同样的问题。假设 `id` 无副作用：

```java
static String id(String p) { return p; }

String a = input();
String b = id(a);       // 调用点 A
String c = id("safe");  // 调用点 B
sink(b);
sink(c);
```

应当得到 b 可能有污点，c 不受 A 的污点影响。本篇仍只追踪显式局部变量传播和正常返回，不展开堆对象、异常与库实现。

## 2. 调用图与过程间控制流图

**调用图（call graph）**的节点是方法，边表示一个方法可能调用另一个方法。它用于寻找调用目标，但单靠 `main→id` 无法表达调用点 A、B 的先后位置和返回点。

**ICFG（过程间控制流图，interprocedural CFG）**用调用边和返回边连接各方法的 CFG：**调用点（call site）**连向被调入口，被调出口连向调用后继续执行的**返回点（return site）**。图中 A、B 分别对应 `retA`、`retB`。

![两个调用点共享 id 方法，返回分别匹配 retA 和 retB](./assets/06-series-1.svg#light)

![两个调用点共享 id 方法，返回分别匹配 retA 和 retB](./assets/06-series-1.dark.svg#dark)

[查看可编辑图源](https://github.com/Scrates1/Scrates1.github.io/blob/main/src/static-analysis/assets/06-series-1.mmd)

图中省略 retA 到 B 等顺序边，虚线表示第 4 节的调用到返回边。两条返回边都存在，但合法执行要求：**从 A 进入 id，必须返回 retA。** 裸图遍历却可能接到 retB，违背调用栈规则。

ICFG 和上下文敏感分析的背景可参见 [Static Program Analysis 第 8 章](https://cs.au.dk/~amoeller/spa/spa.pdf)。

## 3. 调用目标从哪里来

id 的目标直接写在 Jimple 的 `staticinvoke`（字节码 `invokestatic`）里。**虚调用（virtual call）**的目标则由接收者运行时类型决定：`service.read()` 执行哪个 read，需要分析 service 可能指向哪些对象。

```java
interface Reader { String read(); }
class FileReader implements Reader { public String read() { return "file"; } }
class NetReader  implements Reader { public String read() { return input(); } }

Reader service = new FileReader();
sink(service.read());
```

**CHA（Class Hierarchy Analysis，类层次分析）**只看声明类型和类层次：service 的声明类型是 Reader，所有实现了 read 的子类型都算可能目标，得到 `{FileReader.read, NetReader.read}` 两条边。NetReader.read 返回污点，于是 sink 出现一条污点候选路径；但真实执行只会调用 FileReader.read，这是调用图过近似带来的误报。（这里按源码声明类型 Reader 讨论；Soot 在构建 Jimple 时会把这个局部变量的类型收紧为 FileReader，使 CHA 也只剩一个目标，[第 11 篇](11-pointer-analysis.md)第 7 节说明了如何在示例里绕开这一点。）

**基于指向的调用图（points-to-based call graph）**利用接收者的指向集合。这里只有 `new FileReader()` 一个分配点，目标收缩为 `{FileReader.read}`，误报消失。指向分析增加了成本，并与建图互相依赖：调用目标决定分析哪些方法，方法内的赋值又影响指向集合。两者可在求解中共同扩展。

| 方法 | 需要的信息 | 边数 | 代价 |
| :--- | :--- | :--- | :--- |
| CHA | 类层次 | 最多；接口类型往往有大量实现 | 低 |
| **RTA（Rapid Type Analysis）** | 类层次加程序中实际被实例化的类 | 较少 | 低 |
| 基于指向 | 每个引用变量的指向集合 | 最少 | 高；需要全程序指针分析 |

RTA 在 CHA 的基础上只保留程序里确实 `new` 过的类；本例从未实例化 NetReader，RTA 也能收缩到一个目标。在不含反射、动态链接等特殊调用的模型内，三者都是过近似，只是精度不同。调用图的边数直接进入[第 07 篇](07-ifds.md)复杂度中的 `|E|`；多出的边还会把更多方法的局部变量拉进传播，间接放大 `|D|`。Soot 的 `cg` 阶段同时提供 [CHA](https://soot-oss.github.io/soot/docs/4.7.1/jdoc/soot/jimple/toolkits/callgraph/CHATransformer.html) 和 [Spark 指针分析](https://soot-oss.github.io/soot/docs/4.7.1/jdoc/soot/jimple/spark/SparkTransformer.html)两种构造方式，选项见 [Soot 选项手册的 cg 部分](https://soot-oss.github.io/soot/docs/4.7.1/options/soot_options.html)；Spark 的设计见 [Lhoták 与 Hendren 的论文](https://plg.uwaterloo.ca/~olhotak/pubs/cc03.pdf)。

无论哪种方法，都有几类调用不在字节码的调用指令里直接可见：lambda 与方法引用经 `invokedynamic` 在运行时链接；`Method.invoke`、`Class.forName(...).newInstance()` 一类反射调用的目标由字符串决定；Servlet、Spring 一类框架回调不从 main 可达；JNI 进入原生代码后不可见。调用图缺一条边，就少一条传播路径，这就是[第 01 篇](01-goals-and-abstraction.md)第 3.2 节所说“遗漏一个调用目标”导致漏报的位置。这些缺口由后续规划中的覆盖边界专题专门讨论。

本篇后续仍以静态目标 id 为例，把“目标已知”作为假设。

## 4. 按一次调用跟踪变量映射

用 `ret` 作为被调方法返回值的抽象事实，逐步跟踪两次调用：

| 阶段 | A：`b=id(a)` | B：`c=id("safe")` |
| :--- | :--- | :--- |
| 调用前 | a 带污点 | 常量实参不带污点 |
| 参数映射 | a 的事实映射到 p | 不产生 p 的污点事实 |
| 方法内部 | `return p` 产生 ret 的污点 | 不产生 ret 的污点 |
| 对应返回点 | ret 映射到 b | c 不获得污点 |

与此同时，调用者中与返回值无关的事实要保留：执行 A 后 a 仍有污点；执行 B 后 a、b 仍有污点。这由图中的**调用到返回边**表达，下文简称旁路。

无副作用的 id 保留其他变量的事实，调用赋值则覆盖 b 或 c 的旧值，因此旁路要删除接收变量的旧事实。若调用可能修改字段，旁路还需要按副作用模型更新堆事实。

## 5. 流敏感、上下文敏感与路径敏感

| 敏感性 | 保留什么区别 | 不敏感时会出的问题 |
| :--- | :--- | :--- |
| **流敏感（flow-sensitive）** | 语句顺序与程序点 | `x=input(); x="safe";` 后仍保留旧污点 |
| **上下文敏感（context-sensitive）** | 不同调用上下文 | A 的返回污染 B 的接收变量 |
| **路径敏感（path-sensitive）** | 分支条件及其关联 | 把同一路径上的 flag 和 `!flag` 都当作成立 |

第 03 篇已经区分语句顺序，但仍无法排除下面的条件冲突：

```java
String y = "safe";
if (flag)  y = input();
if (!flag) sink(y);       // flag 中途不变
```

即使调用与返回全部匹配，丢失 flag 与 `!flag` 的关联仍可能导致误报。排除这条路径需要保留条件信息，[第 09 篇](09-symbolic-execution-clang.md)会展开这个例子。

## 6. 摘要怎样复用，为什么递归需要迭代？

id 的**摘要（summary）**可记为：**入口 p 有污点，则返回值有污点**。摘要只记录输入对输出的影响，供调用者复用。A 将 a 映射到 p，应用摘要后把返回事实映射到 b；B 没有 p 的污点输入，因此不会污染 c。

递归方法的结果又依赖自身的摘要：

```java
static String idRec(String p, int k) {
    if (k == 0) return p;
    return idRec(p, k - 1);
}
```

它的摘要按下面的步骤迭代得到：

1. 先从直接返回分支发现 p 到返回值的关系。
2. 将这个关系用于递归调用，产生新的候选摘要。
3. 新关系出现就继续传播；不再新增关系时稳定。

## 7. 真实 Java 多了哪些建模问题？

对象、库调用和安全语义还会引入以下问题：

| 情况 | 小例子 | 为什么要补模型 |
| :--- | :--- | :--- |
| 对象别名 | `b=a; a.f=input(); sink(b.f);` | 两个变量可能指向同一个对象；只追踪局部变量名看不到这条传播 |
| 动态派发 | `service.read()` | 接收者运行时类型决定实际调用哪个实现，见第 3 节 |
| 库副作用 | `fill(buffer)` | 信息可能通过参数所指对象流出，而不是返回值 |
| 净化操作 | `y=escape(x); sink(y);` | 污点分析特有的规则：某些调用按约定消除污点，其转移规则要删除事实而不是传递事实；净化通常只对特定 sink 有效 |
| 隐式流 | `if (x.equals("a")) y="a";` | y 的值由 x 的内容决定，却没有赋值把 x 传给 y；主流工具默认不追踪，以控制误报数量 |

对象与调用目标的近似由[第 11 篇](11-pointer-analysis.md)的指针分析展开。净化、隐式流与库模型属于安全语义和工程约定，需要由分析作者定义，不能交给通用求解器决定。

在 Soot 工程中，`cg` 构建调用图，`wjtp` 一类全程序阶段可利用这些关系（见 [Soot 的 Pack 与阶段说明](https://github.com/soot-oss/soot/wiki/Packs-and-phases-in-Soot)）；具体调用目标取决于入口、选项和建模。第 04 篇直接加载一个方法体的代码，并没有自动获得完整应用的调用图。

## 本篇要点

- **调用图**确定可能目标，**ICFG**连接过程间控制流；返回还必须匹配调用点。
- 实参映射到形参，返回值映射到接收变量；**旁路**保留其他事实、删除接收变量的旧事实。
- 流敏感、上下文敏感、路径敏感分别保留顺序、调用上下文与条件关联。
- **摘要**记录可复用的输入输出关系，递归需要迭代摘要。
- 别名、动态派发、库副作用与净化等模型决定真实 Java 分析的覆盖和精度。

[上一篇：05 常量传播与表达式求值](05-constant-propagation.md) · [下一篇：07 IFDS 事实传播](07-ifds.md) · [返回系列总览](README.md)
