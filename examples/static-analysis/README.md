# 第 02—03 篇：程序表示与污点工作列表

这个独立 Maven 工程先展示程序表示与正常控制流，再按第 03 篇的简化规则求解局部变量污点。

- `BranchFlow`：带条件赋值的 Java 程序；`input()` 在教学模型中是来源，打印用的 `sink()` 是敏感操作的占位实现，不代表真实漏洞。
- `InspectGraph`：读取编译后的 `run(boolean)`，打印实际 Jimple、语句级 CFG 和基本块。
- `TaintWorklist`：按普通控制流求解并打印各节点 IN/OUT，内置结果核对，失败时抛出异常。
- `FlowCases`：安全赋值变体和需要沿回边再次传播的循环。
- 固定依赖：公开版 Soot 4.7.1、Java 11 字节码。该版本独立于主仓库的定制 Soot，避免示例依赖内部构建。

## 运行

准备 JDK 11 和可用的 Maven。从仓库根目录执行（将 JDK 路径换成本机实际位置）：

```powershell
& './examples/static-analysis/run.ps1' -JdkHome 'C:/path/to/jdk-11'
```

脚本把构建产物及输出写入 `$env:TEMP/static-analysis-series-02`，也可用 `-OutputDirectory` 指定路径。首次运行 Maven 需要下载依赖。这个工程不属于主仓库的 analyzer 测试序列，无需构建整个分析引擎。

在其他系统上，可在本目录使用 JDK 11 执行 `mvn compile dependency:build-classpath -Dmdep.outputFile=target/classpath.txt`，然后将 `target/classes` 与该文件中的依赖路径拼成 Java classpath，运行 `tutorial.InspectGraph target/classes`。classpath 分隔符在 Windows 上为分号，Linux/macOS 上为冒号；这一跨平台方式未在本文验证环境中运行。

使用同一个 classpath 运行 `tutorial.TaintWorklist target/classes` 可单独执行第 03 篇。PowerShell 脚本会依次执行两篇示例，新增输出为 `taint.txt`；成功时打印 `ALL CHECKS PASSED`。

## 污点结果与模型

实际输出见 [expected/taint.txt](expected/taint.txt)。检查覆盖原始分支的全部节点、常量替换变体、循环重访、自赋值、覆盖赋值、不可达来源和可达空集合。循环有 11 个节点，本次 FIFO 调度访问 22 次；次数不是所有调度的固定要求。

分析只支持示例所需的局部赋值、常量、控制语句和三个明确调用模型：`BranchFlow.input` 产生污点返回值，`BranchFlow.sink` 不改变局部事实，`FlowCases.again` 返回不带污点的未知布尔值且不影响其他变量。布尔参数不带污点，不跟踪隐式流、异常与堆对象；其他语句或调用会报错。安全变体中未使用的 x 接收变量被 Soot 移除，来源调用的返回值丢弃，所以它的 sink 处为可达空集合。

## 如何核对

实际验证环境为 Microsoft OpenJDK 11.0.30、Soot 4.7.1，编译时保留行号、局部变量名等调试信息。Soot 设置 `jb use-original-names:true`，加载目标方法体后直接构图，没有执行额外的整程序优化流水线。

`expected/graph.txt` 和 `expected/bytecode.txt` 保存本次真实输出。`expected/variant-graph.txt` 是仅把源码 `if (flag)` 改为 `if (!flag)` 后，按相同编译选项在独立目录重新编译并分析的结果；该变体输出 `safe`、`external`，Jimple 的条件变为 `flag != 0`。先关注结构，再关注排版：

- CFG 有 7 个语句节点、7 条边；n4 的两个后继是 n5、n6。
- n5 的后继是 n6；n6 是跳过赋值与执行赋值两条分支的汇合位置。
- `BriefBlockGraph` 划分为 B1={n1,n2,n3,n4}、B2={n5}、B3={n6,n7}。
- 直接运行样例依次输出 `external`、`safe`，对应 `flag=true` 和 `flag=false`。

`BriefUnitGraph` 与 `BriefBlockGraph` 展示不含异常边的控制流。本例的分析范围是 `run` 的方法体，不展开被调方法。换用异常感知的图或其他变换选项后，结果可能不同。

验证源码中的 `body.validate()` 检查方法体一致性；这不证明模型覆盖了所有实际行为。输出中的语句编号由 `InspectGraph` 为展示添加，不是 Jimple 自身的编号。
