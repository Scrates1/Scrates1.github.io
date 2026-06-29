---
title: 手写一个词法分析器：编译器的第一步在干什么
date: 2026-06-28
category:
  - 编译
tag:
  - 编译原理
  - 词法分析
---

很多人对编译器的第一印象是"很玄"。但拆开看，它的第一步——**词法分析**——其实朴素得不能再朴素：**把一长串字符，切成一个个有意义的"词"。** 这篇就把这一步彻底讲透，顺便聊几个初学时最容易栽的坑。

> 本文用一个迷你 DSL 的例子，代码全部自写、可运行，不涉及任何专有项目。

<!-- more -->

## 一、先建立直觉：读句子的两步

你读"小明 吃 苹果"这句话，大脑其实分两步：

1. **认词**：先把字符切成 `小明`/`吃`/`苹果`，并知道各自是名词、动词、名词——但**不管这句话通不通顺**。
2. **组句**：再把这些词按主谓宾组织起来，判断合不合法。

编译器一模一样：

- **第一步「认词」= 词法分析（Lexer）**：字符流 → 一个个 token。
- **第二步「组句」= 语法分析（Parser）**：token 流 → 一棵结构树（AST）。

本文只讲第一步。记住这条边界——**很多困惑都来自把这两步混在一起**。

## 二、一个迷你 DSL

假设我们要给一个"规则过滤"DSL 写解析器，它长这样：

```
age >= 18 and active == "true"
```

我们的目标：把这串字符切成 token 序列：

```
IDENT(age)  GE(>=)  NUMBER(18)  AND(and)  IDENT(active)  EQ(==)  STRING(true)  EOF
```

注意几个点先剧透：`>=` 是**一个** token 不是两个；`and` 是**关键字**不是普通名字；`"true"` 切出来的值是 `true`（**没有引号**）；末尾那个 `EOF` 是我们**自己补的**。下面逐一解释。

## 三、token 长什么样

每个 token 我们用三元组表示：

```java
enum Type { IDENT, NUMBER, STRING, GE, LE, EQ, AND, OR, LPAREN, RPAREN, EOF }

record Token(Type type, String value, int pos) {}
```

- `type`：**类别**，给后面的 parser 用——它判断语法时只看 type。
- `value`：token 在原文里的内容。
- `pos`：位置，**报错时用**（"第 12 个字符附近出错"）。

⚠️ 第一个坑：**`(type, value, pos)` 不是铁律，只是一种设计**。真正必须的只有 `type`；`value`、位置信息（单偏移 / 行列 / 区间）都因实现而异。

## 四、核心：一个从左扫到右的循环

词法分析器机械上就是一个 `while`，从头扫到**整段文本**的末尾，每圈吐一个 token：

```java
List<Token> tokenize(String input) {
    List<Token> tokens = new ArrayList<>();
    int pos = 0;
    while (pos < input.length()) {
        // 1) 先跳过空白
        if (Character.isWhitespace(input.charAt(pos))) { pos++; continue; }

        char c = input.charAt(pos);
        // 2) 多字符运算符：要"向前看"
        if (c == '>' && peek(input, pos + 1) == '=') { tokens.add(new Token(Type.GE, ">=", pos)); pos += 2; }
        else if (c == '<' && peek(input, pos + 1) == '=') { tokens.add(new Token(Type.LE, "<=", pos)); pos += 2; }
        else if (c == '=' && peek(input, pos + 1) == '=') { tokens.add(new Token(Type.EQ, "==", pos)); pos += 2; }
        else if (c == '(') { tokens.add(new Token(Type.LPAREN, "(", pos)); pos++; }
        else if (c == ')') { tokens.add(new Token(Type.RPAREN, ")", pos)); pos++; }
        // 3) 变长 token：字符串、数字、标识符/关键字
        else if (c == '"') { pos = readString(input, pos, tokens); }
        else if (Character.isDigit(c)) { pos = readNumber(input, pos, tokens); }
        else if (Character.isLetter(c)) { pos = readWord(input, pos, tokens); }
        else { pos++; } // 不认识的字符：跳过（容错）
    }
    tokens.add(new Token(Type.EOF, "", pos)); // 4) 自己补上结束哨兵
    return tokens;
}

char peek(String s, int i) { return i < s.length() ? s.charAt(i) : '\0'; }
```

这段代码里藏着词法分析的全部精髓，下面挑四个"魔鬼细节"。

## 五、四个魔鬼细节（也是面试最爱问的）

### 细节 1：向前看 + 最长匹配（maximal munch）

为什么处理 `>=` 要 `peek` 下一个字符？因为不偷看，就会把 `>=` 错切成 `>` 和 `=` 两个 token。规则是：**尽量凑出最长的合法符号**。这叫 *maximal munch*。`===`、`!=`、`&&` 同理。

### 细节 2：关键字"先读完整个词，再查表"

看 `readWord`：

```java
int readWord(String s, int pos, List<Token> tokens) {
    int start = pos;
    while (pos < s.length() && Character.isLetterOrDigit(s.charAt(pos))) pos++;
    String word = s.substring(start, pos);          // 先把整个词读出来
    Type t = switch (word) {                          // 再判断是不是关键字
        case "and" -> Type.AND;
        case "or"  -> Type.OR;
        default    -> Type.IDENT;                     // 不是关键字 → 普通标识符
    };
    tokens.add(new Token(t, word, start));
    return pos;
}
```

为什么不能"一看到 a-n-d 就判定关键字"？因为变量名 `android` 会被错切成 `and` + `roid`。**必须先读完整个词（最长匹配），再回头查它是不是关键字。** 关键字和普通标识符走的是同一条读取路径，只是最后查了一次表。

### 细节 3："跳过空白" = 移动指针，不是删除

注意循环里跳空白只是 `pos++`，**原字符串一个字都没改**——我们只是把"读取光标"往前挪，越过没用的字符。注释也是同理（找到注释结尾，把 `pos` 一跳跳过去）。而且这件事是**和切词交织**进行的：每圈先跳空白、再读一个 token，不是先单独跑一遍把空格清光。

### 细节 4：value 不一定等于源码原文

`"true"` 经过 `readString` 切出来，value 是 `true`——**引号没了**：

```java
int readString(String s, int pos, List<Token> tokens) {
    int start = pos++; // 跳过开引号
    StringBuilder sb = new StringBuilder();
    while (pos < s.length() && s.charAt(pos) != '"') {
        if (s.charAt(pos) == '\\') pos++;   // 处理转义：\" 只保留 "
        sb.append(s.charAt(pos++));
    }
    pos++; // 跳过闭引号
    tokens.add(new Token(Type.STRING, sb.toString(), start)); // value 是去引号、解转义后的内容
    return pos;
}
```

编译原理里把这两件事分开叫：

- **lexeme（词素）**：源码里原始匹配到的字符（`"true"` 连引号）。
- **token 的 value/属性**：携带的语义值，**可能是加工后的**（去引号、解转义；数字常直接存解析后的数值）。

两者**不一定相等**——这是个很多人忽略的点。

## 六、还有一个常被自己补、不来自原文的 token：EOF

循环结束后我们手动 `tokens.add(EOF)`。它在原文里**没有对应字符**，纯粹是给 parser 的一个"输入到头了"的哨兵信号，省得 parser 每次去判断"还有没有下一个 token、会不会越界"。

## 七、一个真实的边界 bug（自查代码的眼光）

处理行注释 `//` 时，常见写法是 `indexOf('\n')` 找行尾。但它只认 `\n`：

- Unix `\n` ✓
- Windows `\r\n` ✓（`\r` 在被跳过的区间里一起吞掉）
- 老 Mac 纯 `\r` ✗ —— 找不到 `\n`，会把整行后面全吞到文件末尾。

虽然纯 `\r` 已基本绝迹，但**能主动指出这种边界，恰恰是工程成熟度的体现**。

## 八、那我还要手写吗？ANTLR4 了解一下

上面这些（切词、向前看、关键字查表），其实 **ANTLR4 这类"解析器生成器"能帮你自动生成**——你只写一份 `.g4` 文法声明语言长什么样，它吐出 lexer + parser。

那为什么还讲手写？因为：

1. **懂手写，才真懂 ANTLR4 自动生成的是什么**，不是把它当黑盒。
2. 工业级编译器（GCC、Clang）很多**反而手写递归下降**，图的是更好的报错和控制力。
3. 取舍是：**从零造一门干净的新 DSL → 用 ANTLR4 省事；解析固定庞大的旧语言、追求极致报错 → 手写。**

## 小结

词法分析没那么玄，它就是"把字符切成词"的一个左到右扫描循环。真正的功夫在那几个细节里：**最长匹配、关键字先读后查、跳空白是移指针、value≠源文、哨兵 EOF、跨系统换行边界**。把这几个点说清楚，你对编译器前端的理解就已经超过"会用工具"的层次了。

下一篇我会讲第二步——**语法分析**：这些扁平的 token，是怎么被组装成一棵 AST 树的，以及"递归下降"怎么用函数调用层级实现运算符优先级。
