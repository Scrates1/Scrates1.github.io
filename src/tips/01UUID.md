---
date: 2023-01-17 21:53:34
tags: 数据库
categories: 技术 
---

# UUID 的概念及实现

## 什么是UUID

**UUID（Universally Unique Identifier）全局唯一标识符**，也称 GUID （Globally Unique Identifier）。



有几个用途略有不同的[UUID 版本。](https://www.uuidtools.com/uuid-versions-explained)在完全随机的 UUID 版本 4 中，大约有 5.3 x 10 36 个可能的 UUID。这个数字是如此之大，以至于如果你要在 85 年内每秒生成 10 亿个 UUID，你有 50% 的机会创建一个副本。

重复 UUID 的可能性非常低，可以安全地假设每个 ID 都是唯一的。不同的计算机可以在没有通信的情况下同时生成 UUID，并且仍然确信 UUID 是唯一的。使用 UUID 的独立系统可以随时安全合并，无需担心冲突。

这是一个非常有用的属性，因为当今许多计算机系统都是分布式的。



UUID 可以在本地生成；没有中央协调或登记机构。UUID 在任何唯一标识系统中具有最低的铸造成本。大多数编程语言都有生成 UUID 的方法，这使得它们对于跨系统兼容性很有用。

您甚至可以使用[在线 UUID 生成器](https://www.uuidtools.com/generate)，并且仍然确信该 ID 是全球唯一的。

UUID 标准在 2005 年发布的 [RCF 4122中正式化。](https://tools.ietf.org/html/rfc4122)



## UUID格式

UUID 由 **5 组十六进制数字组成**，由连字符分隔。每组长度为：8-4-4-4-12。UUID 是固定长度的。例如：123e4567-e89b-12d3-a456-426655440000

UUID 有 **32 位数字加上 4 个连字符**，总共 36 个字符。UUID 是固定长度的。UUID 是 128 位的二进制文件。（**32 个十六进制数字 x 每个十六进制数字 4 位 = 128 位**）。

示例：

> ```
> 123e4567-e89b-12d3-a456-426655440000`
> `xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
> ```

第三组数字开头的M表示UUID版本，第四组数字开头的N的1到3个最高有效位表示UUID变体（同一版本的，用来解释某些位），上面例子M是1，N是a（10xx），以为他是按照版本1变体1的逻辑生成的。

UUID 也可以用十进制或二进制格式表示。

| 格式     | 例子                                                         |
| -------- | ------------------------------------------------------------ |
| 十六进制 | 123e4567-e89b-12d3-a456-426655440000                         |
| 十进制   | 190464649652423269416550308090595239059                      |
| 二进制   | 10001111 01001010 00101000 00111110 11111111 10100101 01001010 00100100 10100010 01110111 00000001 11000110 00001000 10101010 10101010 |



## UUID 可以重复吗？

UUID 冲突极不可能发生。

对于 UUID version-1，生成 UUID 的计算机的 MAC 地址嵌入在 UUID 中。MAC 地址在每台带有网卡的计算机上都是唯一的。如果两台不同的计算机都遵守规范，这使得它们不可能生成相同的 UUID。时间戳也包含在 UUID 中以确保唯一性。时间戳字段将在公元 5236 年翻转。所以在那之前没有重复的机会。

**对于版本 4，重复的可能性非常小。**

对于完全随机的版本 4 UUID，大约有 5.3 x 10 36 个可能的 UUID。由于数字如此之大，全世界任何两个人生成相同 UUID 的机会都非常小。机会是如此之小，以至于通常可以安全地假设它永远不会发生。

对于版本 3 和版本 5，UUID 输出基于您提供的输入。只要提供的输入是随机的，重复的机会就与版本 4 相同。

[了解有关 UUID 版本的更多信息 »](https://www.uuidtools.com/uuid-versions-explained)



## UUID 正则表达式 (REGEX)

下面的正则表达式可用于验证 UUID 的格式：

```
[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
```



## UUID 区分大小写吗？

不，UUID 是以 16 进制编写的，它使用数字 0-9 和字符 af。不区分大小写字母。但是，[RCF 4122 第 3 节](https://tools.ietf.org/html/rfc4122#section-3)要求 UUID 生成器以小写形式输出，并且系统接受大写和小写的 UUID。



## 不同版本 UUID 区别

* **UUID Version 1：基于时间的UUID**

基于时间的UUID通过计算当前**时间戳、随机数和机器MAC地址（即（计算机或“节点”）MAC地址）**得到。

由于在算法中使用了MAC地址，这个版本的UUID可以保证在**全球范围的唯一性**。但与此同时，使用MAC地址会带来安全性问题，这就是这个版本UUID受到批评的地方。如果应用只是在**局域网中使用**，也可以使用退化的算法，**以IP地址来代替MAC地址**，Java的UUID往往是这样实现的（当然也考虑了获取MAC的难度）。但由于时间因素的顺序为时间低位在前，高位在后，不适合做主键，可以组合。

![显示 UUID 版本 1 的记录布局的图表](https://www.uuidtools.com/img/version_1_diagram.png)

* **UUID Version 2：一般不用**

版本 2 在 RFC 4122 中称为“DCE 安全”UUID。官方 RFC 中未提供更多详细信息。 [然而，版本 2 规范](https://pubs.opengroup.org/onlinepubs/9696989899/chap5.htm#tagcjh_08_02_01_01)由 DCE 发布。

* **UUID Version 3：基于名字的UUID（MD5）**

基于名字的UUID通过计算名字和名字空间的MD5散列值得到。

这个版本的UUID保证了：

1. 相同名字空间中不同名字生成的UUID的唯一性
2. 不同名字空间中的UUID的唯一性
3. 相同名字空间中相同名字的UUID重复生成是相同的。

* **UUID Version 4：随机UUID**

根据随机数，或者伪随机数生成UUID。这种UUID产生重复的概率是可以计算出来的，但随机的东西就像是买彩票：你指望它发财是不可能的，但狗屎运通常会在不经意中到来。

* **UUID Version 5：基于名字的UUID（SHA1）**

和版本3的UUID算法类似，只是散列值计算使用SHA1（Secure Hash Algorithm 1）算法。

* **时间戳优先的 UUID**

UUID RFC 中没有提到时间戳优先；但是，它们是**版本 4 UUID 的常见变体**。这种格式有时称为**“有序 UUID”或“COMB”**（组合时间 GUID）。

此版本从当前时间开始，然后是随机性。使用当前时间戳开始 UUID 有两个主要原因：

1. 按 UUID 排序时，它们将出现在创建的顺序中
2. 与随机 UUID 相比，有序 UUID 可以更有效地存储在索引数据库列中



由于**没有就规范达成一致**，因此在不同的实现中有多种时间戳优先 UUID 的变体。但是，**通常前 8 个十六进制数字表示时间**，其余数字是随机的。

如果您使用 **UUID 作为数据库中的主键**，您应该使用**时间戳优先的 UUID**。

## JS 中生成 UUID

由上面的版本可知，在浏览器里的JS下基本上无法使用版本1，2，3，5，现使用方法四来模拟生成UUID。

* 算法一

```js
function uuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";//16进制对应的字母
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);//将上面十六进制对应的字母随机截取一个
    }
    s[14] = "4";  // 代表版本四
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
 
    var uuid = s.join("");
    return uuid;
}
```

> * js substr() 函数含义：
>
> substr(start)
> substr(start, length)
>
> * 0x10: 0x代表16进制，对应十进制的16

* 算法二

```js
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
```

* 算法三

```js
function guid() {
    function S4() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
```

* 算法四

```js
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;
 
    if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
    } else {
      // rfc4122, version 4 form
      var r;
 
      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
 
      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
 
    return uuid.join('');
}
```

算法四可以指定长度和基数（基数就是几进制）：

```js
// 8 character ID (base=2)
uuid(8, 2)  //  "01001010"
 
// 8 character ID (base=10)
uuid(8, 10) // "47473046"
 
// 8 character ID (base=16)
uuid(8, 16) // "098F4D35"
```

## 在线获得一个 UUID

https://www.uuidtools.com/

## JAVA 实现 UUID

java使用这面临一个比较尴尬的现状：JDK里目前只有版本4的实现，如果需要使用其他的版本，可以参考JUG开源实现

[https://github.com/cowtowncoder/java-uuid-generatorgithub.com/cowtowncoder/java-uuid-generator](https://link.zhihu.com/?target=https%3A//github.com/cowtowncoder/java-uuid-generator)

> 题外话：
>
> 了解JAVA的知道 class 里有个 serialVersionUID。
>
> 当其用在序列化和反序列化的场景时，要区别用的是不是一个版本：
>
> ​		如果反序列化的时候发现 UID 与序列化的 UID 不一样，则会抛出一个异常 InvalidClassException。当你修改了这个类，然后认为是**向前兼容的（如增加一个新属性），则不用修改 UID 的值。**反之则要修改该值（如删除或修改了原属性）。
> ​		serialVersionUID 如果没有显式生成，虚拟机会按照类名属性自己生成一个，不同虚拟机的实现方案不一样，所以可能同一个类在接收和发送端生成的 UID 不一样导致反序列化失败，故**建议所有序列化的类都由用户显式生成这个值**。



## 参考文献

* https://www.uuidtools.com/what-is-uuid
* https://www.uuidtools.com/uuid-versions-explained
* https://blog.csdn.net/mr_raptor/article/details/52280753
* https://zhuanlan.zhihu.com/p/71945613