---
title: "09｜符号执行与 Clang：怎样排除不可行路径？"
shortTitle: "09 符号执行与 Clang"
order: 9
date: 2026-09-28
category:
  - 静态分析
tag:
  - 符号执行
  - Clang Static Analyzer
  - 路径敏感
---

::: tip 读前须知
读过第 03 篇即可理解路径推演，调用相关内容用到第 06 篇。本篇观察路径条件怎样排除误报；第 6 节与 IFDS/IDE 的比较需先读第 07、08 篇。
:::

<!-- more -->

**符号执行（symbolic execution）**在状态中保留路径条件，用约束判断后续分支是否可行。

## 1. 两个互斥的分支

假设 flag 中途不变，input 是来源，sink 是敏感操作：

```java
String y = "safe";
if (flag)  y = input();
if (!flag) sink(y);
```

合并式 may 分析可能记录 y 有污点，再把它送到 sink。但来源赋值要求 flag 为真，执行 sink 要求 flag 为假。要发现冲突，状态必须保留这两个条件。

## 2. 符号值与路径条件

用**符号值（symbolic value）**为未知量命名：β 代表 flag，σ 代表 input 的结果。沿途分支的要求累积为**路径条件（path condition）**；条件无法同时成立时，就是**不可行路径（infeasible path）**。

沿 CFG 保存值与路径条件，可以得到以下推演；这张表是语义示例，并非 Clang 运行日志。

| 到达位置 | 路径条件 | y 的值与来源 | 下一步 |
| :--- | :--- | :--- | :--- |
| 第一次 if 之前 | true，无额外约束 | `"safe"` | 分成两条状态 |
| 第一分支为真之后 | β | σ，来自 input | 第二个 if 要求 `¬β` 才进入 |
| 第一分支为假之后 | `¬β` | `"safe"` | 第二个 if 可进入 |
| 污点状态尝试进入 sink | `β ∧ ¬β` | σ | 条件冲突，排除 |
| 安全状态进入 sink | `¬β` | `"safe"` | 可行，但没有污点 |

`¬` 读作“非”，`∧` 读作“且”。这里的冲突只涉及同一个布尔符号，无需复杂算术求解。

![路径条件 β 与非 β 冲突，排除带污点的 sink 路径](assets/09-series-1.svg#light)

![路径条件 β 与非 β 冲突，排除带污点的 sink 路径](assets/09-series-1.dark.svg#dark)

[查看可编辑图源](https://github.com/Scrates1/Scrates1.github.io/blob/main/src/static-analysis/assets/09-series-1.mmd)

图只展开与进入 sink 有关的路线；flag 为真时跳过第二个分支的正常结束路线省略。

## 3. 路径探索的限制

实际引擎的探索能力受三方面限制：

- 内存对象、别名与库行为如何表达。
- 约束管理器能表达和求解哪些条件；超出能力的条件只能保留为未知。
- 循环探索、内联与节点数预算；具体限制取决于版本和[分析器配置](https://clang.llvm.org/docs/analyzer/user-docs/Options.html)。

逐路径展开 n 个独立的 if，最多产生 `2ⁿ` 条路径。未知条件保留两个分支，可能引入误报；预算耗尽而放弃剩余探索，则可能漏报。

若 flag 在两次判断之间被重新赋值，两次测试可能不再对应同一符号，原来的矛盾推导就失效。

## 4. Clang 的位置与状态表示

Clang 的编译路线与分析路线已在[第 02 篇](02-compilation-and-tools.md)第 5 节图 6 定位。Static Analyzer 在源码级表示上做路径敏感探索，图节点 `ExplodedNode` 包含 `ProgramPoint` 和 `ProgramState`。[检查器开发手册](https://clang-analyzer.llvm.org/checker_dev_manual)

| 对象 | 作用 | 与上例的对应 |
| :--- | :--- | :--- |
| ProgramPoint | 执行位置及处理阶段 | 第二个 if 之前、调用 sink 之前 |
| Environment | 表达式到 SVal 的映射；SVal 是符号值、具体值或内存位置的统一表示 | 某表达式当前求得的值 |
| Store | 内存区域到值的映射 | 局部变量 y 所在区域保存的值 |
| GenericDataMap | 约束及检查器自定义数据 | 对符号的限制、来源等额外状态 |

后三项构成 ProgramState 的主要内容，`ConstraintManager` 则负责约束的推理与更新。定义可对照 [ProgramState.h](https://clang.llvm.org/doxygen/ProgramState_8h_source.html)，Store 的区域建模见 [Region Store 文档](https://clang.llvm.org/docs/analyzer/developer-docs/RegionStore.html)。

同一程序点可保留 β、`¬β` 路线上的不同状态，也可共享已有节点，组成 `ExplodedGraph`。

## 5. 检查器的回调与自定义状态

引擎推进执行，检查器在回调中处理规则。例如污点检查器可以这样设计：

| 事件 | 示例处理 |
| :--- | :--- |
| input 正常返回之后 | 把返回值的符号记为带特定来源标记 |
| 赋值 `y = input()` | 不需要回调：同一个符号经 Store 绑定到 y 的区域，标记随符号走 |
| sink 调用之前 | 检查参数对应符号及当前路径状态 |
| 找到违规状态 | 构造带位置与路径解释的报告 |

真实检查器可注册 `check::PreCall`、`check::PostCall` 等回调。自定义状态应用 `REGISTER_MAP_WITH_PROGRAMSTATE` 一类宏注册到 ProgramState 里；ProgramState 按不可变值使用，更新产生新状态，再通过 `CheckerContext::addTransition` 交回引擎。把路径信息放在检查器实例的普通可变成员中，会混淆不同路径。[自定义状态与回调说明](https://clang-analyzer.llvm.org/checker_dev_manual)

对于函数调用，Clang 可以在调用上下文中内联分析；无法内联时，通过模型或状态失效处理近似调用效果。内联深度和探索预算会限制可检查的行为范围。[Clang 过程间分析文档](https://clang.llvm.org/docs/analyzer/developer-docs/IPA.html)

## 6. 与 IFDS/IDE 的组织方式比较

| 维度 | IFDS/IDE | Clang Static Analyzer |
| :--- | :--- | :--- |
| 节点与边携带的信息 | 节点是程序点加单事实；IDE 在边上另有值变换 | 节点是程序点加一份抽象状态 |
| 跨函数组织 | 匹配路径与过程摘要 | 上下文中的调用探索、内联及模型 |
| 条件关联 | 需显式编码或另外处理 | 状态中维护路径约束 |
| 主要成本 | 事实域、路径边、跳转函数和摘要 | 状态分叉、约束及调用展开 |

## 本篇要点

- **符号值与路径条件**保留分支关联，可排除 `β∧¬β` 这样的不可行路径。
- 精度与覆盖受模型、约束能力及探索预算限制；赋值后需更新符号绑定。
- Clang 以程序点和状态组成 `ExplodedNode`，检查器通过回调更新不可变状态，避免混淆路径。
- IFDS/IDE 以事实关系和摘要组织传播；Clang 以抽象状态、调用探索与模型组织分析。

下一篇回到 IDE，讨论第 08 篇中跳转函数的工程成本。

[上一篇：08 IDE 值传播](08-ide.md) · [下一篇：10 IDE 求解器工程优化](10-ide-solver-engineering.md) · [返回系列总览](README.md)
