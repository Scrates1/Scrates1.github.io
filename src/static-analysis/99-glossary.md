---
title: "术语表"
shortTitle: "术语表"
order: 99
date: 2026-09-29
article: false
category:
  - 静态分析
---
按首次定义的篇目排序。每条给出中文术语、英文原文、一句话解释，以及在贯穿例子中的所指。正式定义以所在篇目为准，这里只帮助回忆。

## 第 01 篇：状态、抽象与近似

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 具体状态 | concrete state | 某次真实执行在某个时刻的全部信息 | `flag=true, x="alice", y="alice"` |
| 抽象状态 | abstract state | 分析实际保存的、概括了一组具体状态的记号 | `{x,y}`：x、y 都可能有污点 |
| 抽象域 | abstract domain | 分析允许写下的全部抽象状态的集合 | `𝒫({x,y})` 的四个元素 |
| 事实 | fact | 抽象状态中的一个原子条目 | `x` 表示“x 可能有污点” |
| γ（具体化） | concretization | 一个抽象状态所“放行”的全部具体状态 | `γ({x})` 不含任何 y 有污点的状态 |
| 转移函数 | transfer function | 一条语句怎样把执行前的抽象状态变成执行后的 | `y=x`：删旧 y，若含 x 则加 y |
| 控制流汇合 | control-flow merge / join point | 多条执行路线到达同一位置 | if 语句之后的 `sink(y)` |
| 过近似 | over-approximation | 结果覆盖全部真实行为，允许多算 | 报告 y 可能有污点，即使某些路径上没有 |
| 欠近似 | under-approximation | 结果只含真实行为，允许漏算 | 只探索 flag=false 一条路径 |
| 可靠 | sound | 在规定模型下结果覆盖真实行为，不漏报 | `R ⊆ γ(S)` |
| 精确度 | precision | 结果排除了多少不可能的情况 | `{x}` 比 `{x,y}` 精确 |
| 误报 / 漏报 | false positive / false negative | 报告了不存在的问题 / 遗漏了真实问题 | 用 `{x,y}` 进入 `if(!flag) sink(y)` 是误报 |
| 路径敏感 | path-sensitive | 分析区分不同分支条件下的状态 | 分别保存 `(flag=true, {x,y})` 与 `(flag=false, {x})` |
| may / must | may / must analysis | 事实“可能成立”还是“所有路径都成立” | 可能有污点 / 保证已初始化 |

## 第 02 篇：程序表示

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 中间表示 | IR, intermediate representation | 编译器或分析器内部使用的程序形式 | Jimple |
| 抽象语法树 | AST, abstract syntax tree | 按源码语法结构组织的树 | Clang 前端的输出 |
| Jimple | — | Soot 的有类型三地址中间表示 | `y = x;`、`if flag == false goto n6;` |
| 控制流图 | CFG, control-flow graph | 节点是语句或基本块，边是可能的执行转移 | n1…n7 与 n4→n5、n4→n6 |
| 基本块 | basic block | 只能从块首进入、块末离开的连续语句 | B1={n1…n4} |
| 字节码 | bytecode | JVM 执行的指令序列 | `aload_1; astore_2` 对应 `y=x` |

## 第 03 篇：数据流传播

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| IN / OUT | in-set / out-set | 每个节点语句执行前 / 后的抽象状态 | `IN[n6]={x,y}` |
| 向前分析 | forward analysis | 信息沿执行方向从前驱流向后继 | 污点从 input 流向 sink |
| 工作列表 | worklist | 等待重新计算的节点队列 | `[Z,S]` |
| 回边 | back edge | 从循环体末尾回到循环头的边 | C→H |
| 可达标记 | reachability flag | 区分“没执行到”与“执行到了但集合为空” | 入口可达且 IN=∅ |

## 第 04 篇：偏序、格与不动点

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 偏序 | partial order | 自反、反对称、传递的比较关系，允许有元素不可比 | 本系列 `a ⊑ b` 表示 a 至少和 b 一样精确 |
| 格 | lattice | 任意两元素都有最小上界和最大下界的偏序集 | `𝒫({x,y})` |
| Join / 最小上界 | join, least upper bound, ⊔ | 能同时容纳两边、又不多容的最小结果 | 污点：并集；初始化保证：交集 |
| Meet / 最大下界 | meet, greatest lower bound, ⊓ | Join 的对偶 | 污点：交集 |
| ⊤ / ⊥ | top / bottom | 格中最粗 / 最精确的元素 | 污点域：`{x,y}` / `∅` |
| 单调 | monotone | 输入按偏序变粗，输出不会变精 | `y="safe"` 的规则单调但会删事实 |
| 不动点 | fixed point | 再算一遍也不变的状态 | 循环头稳定在 `{x,y,z}` |
| 上升链 / 有限高度 | ascending chain / finite height | 严格变粗的序列 / 这种序列有长度上限 | `{x} ⊏ {x,y} ⊏ {x,y,z}` |
| 加宽 | widening, ∇ | 强行跳到更粗的元素以迫使迭代停止 | `[0,1] ∇ [0,2] = [0,+∞)` |
| 序对偶 | order duality | 把偏序整个反过来，Join 与 Meet 互换 | 其他教材把并集叫 Meet 的原因 |

## 第 05 篇：常量传播

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 平坦格 | flat lattice | 底、一层互不可比的元素、顶三层结构 | `⊥ ⊑ 3 ⊑ ⊤` |
| 环境 | environment, ρ | 变量到抽象值的映射 | `ρ={a↦3,b↦7}` |
| 常量传播 / 折叠 | constant propagation / folding | 分析出常量 / 用分析结果改写程序 | 得出 b=7 / 把 `3+4` 改成 `7` |

## 第 06 篇：过程间分析

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 调用图 | call graph | 节点是方法，边是“可能调用” | main→id |
| 过程间控制流图 | ICFG, interprocedural CFG | 把各方法的 CFG 用调用边、返回边缝在一起 | A→id 入口，id 出口→retA |
| 调用点 / 返回点 | call site / return site | 发出调用的位置 / 调用返回后继续执行的位置 | A / retA |
| 类层次分析 | CHA, class hierarchy analysis | 只按声明类型与子类关系确定调用目标 | `service.read()` 得到两个目标 |
| 基于指向的调用图 | points-to-based call graph | 先算变量指向哪些对象，再确定目标 | 收缩为 `FileReader.read` |
| 上下文敏感 | context-sensitive | 区分同一方法在不同调用处的分析结果 | A 的返回不污染 B 的 c |
| 流敏感 | flow-sensitive | 区分语句顺序 | `x=input(); x="safe";` 后 x 干净 |
| 调用到返回边 / 旁路 | call-to-return edge | 调用者中不经被调方法传播的事实所走的边 | 执行 A 时 a 的污点直接保留 |
| 摘要 | summary | 方法“输入怎样影响输出”的可复用记录 | id：入口 p 有污点则返回值有污点 |
| 净化 | sanitizer | 按约定消除污点的操作 | `escape(x)` |
| 隐式流 | implicit flow | 值通过条件判断而非赋值影响另一变量 | `if (x.equals("a")) y="a";` |

## 第 07 篇：IFDS

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| IFDS | Interprocedural Finite Distributive Subset | 满足分配律的有限事实集合问题的过程间求解框架 | 本系列的污点传播 |
| 分配律 | distributivity | 先合并再转移与分别转移再合并结果相同 | `f(A∪B)=f(A)∪f(B)` |
| 辅助事实 Λ | zero fact, Λ | 表示“无条件成立”的人为事实，用来生成新事实 | `Λ→x` 表示 `x=input()` |
| 表示关系 | representation relation | 一条语句的流函数拆成的单事实边集合 | `y=x`：`x→x`、`x→y` |
| 爆炸超图 | ESG, exploded supergraph | 节点是 `(程序点, 事实)`，边是单事实传播 | `(A 之前, a) → (entry, p)` |
| 四类流函数 | normal / call / return / call-to-return | 方法内 / 实参到形参 / 返回值到接收变量 / 旁路 | 见 07 第 5 节表 |
| 路径边 | path edge | “从方法入口带着 d₀ 进来，现在在 n 处是 d” | `〈p, exit, ret〉` |
| Incoming | incoming | 等待某个被调入口事实结果的调用记录 | A 等待 `(id, p)` |
| 可实现路径 | realizable path | 调用与返回按栈匹配的路径 | A 进 id 必须回到 retA |
| MRP / MOP | meet over all realizable / all paths | 只沿可实现路径合并 / 沿所有路径合并 | IFDS 求的是 MRP |
| CFL 可达性 | CFL-reachability | 路径上标签串须属于某个上下文无关语言 | 调用返回的括号匹配 |

## 第 08 篇：IDE

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| IDE | Interprocedural Distributive Environments | 在 IFDS 的事实边上附加值变换 | 求 u=15、v=30 |
| 边函数 | edge function | 一条事实边上值怎样变 | `t↦t+2` |
| 跳转函数 | jump function | 从方法入口到某个目标事实的所有边函数组合结果 | `〈p, exit, ret, t↦5(t+2)〉` |
| 函数组合 | composition, ∘ | 先做 f 再做 g 写作 `g∘f` | `5(t+2)` |
| 两阶段求解 | phase I / phase II | 先算稳定的跳转函数，再代入入口值 | 先得 j，再算 j(1)、j(4) |

## 第 09 篇：符号执行

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 符号值 | symbolic value | 不知道具体值时先起的名字 | β 表示 b 的值 |
| 路径条件 | path condition | 走到当前位置必须满足的约束合取 | `β ∧ ¬β` |
| 不可行路径 | infeasible path | 路径条件不可满足的路径 | 带污点进入 sink 的那条 |
| ProgramState / ExplodedNode | — | Clang 中一条路径的状态 / 图中“位置加状态”的节点 | 见 09 第 4 节表 |

## 第 10 篇：求解器工程

| 术语 | 英文 | 一句话解释 | 在例子中 |
| :--- | :--- | :--- | :--- |
| 跳转函数表布局 | jump function layout | 用什么嵌套结构存 `(n,d₁,d₂)→f` | JF_ND、JF_N |
| 批处理 | batching | 固定外层键后一次处理多条更新 | 复用 `table[n]` |
| 条目回收 | garbage collection of jump functions | 方法内部条目在确认不再需要后释放 | 保留 `p→ret`，回收 `p→a` |
| 稀疏化 | sparse analysis | 事实只在定义与使用之间传播 | SVF |
| 按需求解 | demand-driven analysis | 只从查询点出发探索 | Boomerang |

[返回系列总览](README.md)
