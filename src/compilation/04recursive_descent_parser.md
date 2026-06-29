---
title: 递归下降解析器：用函数调用层级实现运算符优先级
date: 2026-06-29
category:
  - 编译
tag:
  - 编译原理
  - 语法分析
  - 递归下降
---

[上一篇](./03lexical_analysis.html)我们把字符流切成了一串扁平的 token。这一篇讲编译器的第二步——**语法分析（Parser）**：把这串扁平 token 组装成一棵有结构的**抽象语法树（AST）**，并重点讲清一个很多人觉得"玄"的问题——**运算符优先级到底是怎么实现的**。

> 本文用一个自写的迷你 DSL 做例子，代码可运行，不涉及任何专有项目。

<!-- more -->

## 一、从"一串词"到"一棵树"

接着上一篇的迷你过滤 DSL，假设我们要解析这样的条件：

```
age >= 18 and active == "true"
```

词法分析给我们的是**扁平**的 token：

```
IDENT(age) GE(>=) NUMBER(18) AND IDENT(active) EQ(==) STRING(true)
```

它是"平的"——没有层次。但这句话其实有结构：它是一个 **and**，左边是 `age >= 18`，右边是 `active == "true"`。**parser 的活，就是把扁平 token 组装成表达这种结构的树**：

```
        And
       /    \
   (age>=18) (active=="true")
```

- **词法**：字符 → 词（token）。
- **语法**：词 → 结构（AST）。
  这条边界很重要：lexer 不关心 `age >= 18` 是什么意思，它只负责切词；"它是个比较表达式"是 parser 的判断。

## 二、先用文法把规则写下来

描述"什么样的 token 序列是合法的"，要用**文法（grammar）**。常用记号是 **BNF/EBNF**：

| 符号 | 含义 |
|---|---|
| `::=` | 定义为 / 由……构成 |
| `'or'`（带引号）| 终结符，真实 token |
| `( )*` | 重复 0 次或多次 |
| `[ ]` | 可选（0 或 1 次）|
| `\|` | 或（多选一）|

我们这门条件 DSL 的文法（注意规则的**排列顺序**，下面会发现它就是优先级）：

```
expr       ::= orExpr
orExpr     ::= andExpr ('or'  andExpr)*      ← or  最外层
andExpr    ::= notExpr ('and' notExpr)*      ← and 里一层
notExpr    ::= 'not' notExpr | primary       ← not 再里一层
primary    ::= '(' expr ')' | comparison     ← 最里层：括号 / 原子
comparison ::= IDENT ('==' | '>=') value
```

## 三、递归下降：一条规则 = 一个函数

**递归下降（recursive descent）**是最直观的解析方法，名字拆开看：

- **下降**：从文法**最顶层**的规则（`expr`）出发，**一层层往下**拆到最小的 token。方向是自顶向下。
- **递归**：因为文法是递归定义的（`primary` 里又出现了 `expr`），实现它的函数自然会**互相调用、甚至调用自己**。

实现规则很简单：**一条文法规则，写成一个函数**。

```java
List<Token> tokens;
int pos;

Token peek()           { return tokens.get(pos); }        // 看当前，不消费
Token peek(int ahead)  { return tokens.get(pos + ahead); } // 向前看，不消费
Token next()           { return tokens.get(pos++); }       // 消费一个

// expr ::= orExpr
Node parseExpr() { return parseOr(); }

// orExpr ::= andExpr ('or' andExpr)*
Node parseOr() {
    Node left = parseAnd();              // ① 左操作数：先让 and 层吃一整块
    while (peek().type == OR) {
        next();                          // ② 吃掉 'or'
        Node right = parseAnd();         // ③ 右操作数：又让 and 层吃一整块
        left = new Or(left, right);      // ④ 用 OR 把两块拼起来
    }
    return left;
}

// andExpr ::= notExpr ('and' notExpr)*   —— 结构和 parseOr 一模一样
Node parseAnd() {
    Node left = parseNot();
    while (peek().type == AND) {
        next();
        Node right = parseNot();
        left = new And(left, right);
    }
    return left;
}

// notExpr ::= 'not' notExpr | primary
Node parseNot() {
    if (peek().type == NOT) {
        next();
        return new Not(parseNot());      // 递归调用自己，支持 not not a
    }
    return parsePrimary();
}

// primary ::= '(' expr ')' | comparison
Node parsePrimary() {
    if (peek().type == LPAREN) {
        next();                          // 吃 '('
        Node inner = parseExpr();        // 递归回到顶层 —— 括号里能塞一整个表达式
        expect(RPAREN);                  // 吃 ')'
        return inner;
    }
    return parseComparison();
}
```

看出来了吗——**代码的调用结构，和文法的规则结构长得一模一样**。这就是递归下降最大的优点：直观、可读、好维护。

## 四、【核心】优先级是怎么"长"进树里的

这是面试最爱问的点。规律记住一句：

> **越外层（越早被调用）的运算符，优先级越低、在树里越靠根；越内层的优先级越高、越靠叶子。**

为什么这条调用链 `parseOr → parseAnd → parseNot → parsePrimary` 就能保证 `and` 比 `or` 优先级高？**关键在这一步**：

`parseOr` 要取它的操作数时，**不是抓一个 token，而是调用 `parseAnd`**；而 `parseAnd` 会**贪心地把一整条 and 链先结合好再返回**。所以等 `parseOr` 看到 `or` 时，所有更紧的 `and` 早就被打包成一个整体了。

拿 `a or b and c`（a/b/c 是原子条件）走一遍：

1. `parseOr` 调 `parseAnd` 取左操作数 → `parseAnd` 看到 `a` 后面是 `or`（不是 `and`），返回 `a`。`left = a`。
2. `parseOr` 看到 `or`，吃掉，调 `parseAnd` 取右操作数。
3. 这次 `parseAnd`：取到 `b`，发现后面是 `and` → 吃掉 → 取 `c` → **结合成 `And(b, c)` 整体返回**。
4. `parseOr` 把两边拼起来：`Or(a, And(b, c))`。

```
     Or
    /  \
   a    And      ← and 在更深一层，绑得更紧
       /   \
      b     c
```

`and` 之所以先结合，正是因为它在调用链的**内层**、先被 `parseAnd` 贪心处理掉。**优先级不是靠什么优先级表，而是靠函数调用的层级"长"出来的。** 而括号 `(...)` 能强行改变这一切——因为 `parsePrimary` 遇到 `(` 会递归回 `parseExpr`，把括号里的内容当成一个最高优先级的整体。

## 五、遇到歧义怎么办：向前看（lookahead）

有时解析到某处，**同样的开头可能是两种结构**，光看当前 token 决定不了。办法是**向前看**：偷看后面一两个 token（不消费），据此决定走哪条分支。

比如某 DSL 里，`IDENT` 开头既可能是比较 `name == "x"`，也可能是函数调用 `name(...)`。这时就 `peek(1)` 看第二个 token：是 `(` 就走函数调用分支，是 `==` 就走比较分支。`peek()`/`peek(1)` 这类"只看不消费"的侦察，正是消除歧义的核心手段。

## 六、别让一行写错就崩：错误恢复

工业级解析器还要容忍输入不规范。常见做法是区分两种"吃 token"：

```java
Token consume(Type t) {                  // 硬：不匹配就抛异常
    if (peek().type != t) throw error("expected " + t);
    return next();
}
void expect(Type t) {                    // 软：不匹配只记日志、不崩，继续解析
    if (peek().type == t) pos++;
    else log("recover: missing " + t);
}
```

"必须存在"的地方用 `consume`；可以容错的地方（比如某个右括号）用 `expect` 软恢复。再在最外层 `try/catch` 兜底，一条规则写错就不会拖垮整个解析。

## 七、这些 ANTLR4 都能自动生成

上面这套（递归下降、优先级链、向前看），其实 **ANTLR4 这类解析器生成器能帮你自动生成**。你只写一份 `.g4` 文法——它和 BNF 几乎逐字一样，只是把 `::=` 换成 `:`、用 `;` 收尾：

```
BNF :  orExpr ::= andExpr ('or' andExpr)*
g4  :  orExpr :  andExpr ('or' andExpr)* ;
```

ANTLR4 甚至能直接写左递归 + 按规则顺序声明优先级，自动生成上面那条手写调用链。

那为什么还要懂手写？因为：**懂手写，才真懂 ANTLR4 自动生成了什么**，而不是把它当黑盒；而且 GCC、Clang 这些工业编译器很多反而手写递归下降，图的是更好的报错和控制力。取舍是：从零造一门干净的新 DSL → 用 ANTLR4 省事；解析固定庞大的旧语言、追求极致报错 → 手写。

## 小结

语法分析就是把扁平 token 组装成 AST 树。递归下降的精髓在于：**代码结构 = 文法结构，运算符优先级靠函数调用的层级自然长出来**（外层=低优先级=靠根，内层=高优先级=靠叶子）。再配上向前看消歧、软恢复容错，就是一个能用的解析器了。

有了 AST，下一步就是**语义**：遍历这棵树去做点什么——求值、类型检查，或者像静态分析里那样，把规则的语义注入到中间表示（IR）上。这个后面再聊。
