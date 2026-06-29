---
title: 迭代器 Iterator 详解
date: 2023-07-13
category:
  - Java
tag:
  - 集合
  - 迭代器
---

# 迭代器 Iterator 详解

迭代器（Iterator）是遍历集合的统一入口。本文先从 `ArrayList` 的迭代器源码看它怎么工作，再讲它的使用、`remove()`，以及面试高频的 fail-fast 机制。

## 一、从 ArrayList 的迭代器源码看起

以 `ArrayList` 为例，当我们写：

```java
Iterator<Integer> iterator = arrayList.iterator();
```

会调用 `ArrayList.iterator()`：

```java
public Iterator<E> iterator() {
    return new Itr();
}
```

它新建了一个内部类 `Itr` 对象，并初始化三个字段：`cursor = 0`（下一个要返回的元素下标）、`lastRet = -1`（上一个返回的元素下标）、`expectedModCount = modCount`（创建迭代器时集合修改次数的快照）。

随后我们通常这样遍历：

```java
while (iterator.hasNext()) {
    int value = iterator.next();
    System.out.print(value + " ");
}
```

`Itr` 的核心实现如下：

```java
private class Itr implements Iterator<E> {
    int cursor;       // 下一个要返回的元素下标
    int lastRet = -1; // 上一个返回的元素下标；没有则为 -1
    int expectedModCount = modCount;

    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }

    public void remove() {
        if (lastRet < 0)
            throw new IllegalStateException();
        checkForComodification();
        try {
            ArrayList.this.remove(lastRet);
            cursor = lastRet;
            lastRet = -1;
            expectedModCount = modCount;
        } catch (IndexOutOfBoundsException ex) {
            throw new ConcurrentModificationException();
        }
    }

    final void checkForComodification() {
        if (modCount != expectedModCount)
            throw new ConcurrentModificationException();
    }
}
```

**为什么迭代器不能重复使用？** 因为每次 `iterator()` 都会 `new` 一个全新的 `Itr`，`cursor` 从 0 开始；一旦遍历完，`cursor` 已等于 `size`，`hasNext()` 恒为 `false`，又没有重置入口，只能重新获取一个新迭代器。

## 二、迭代器是什么

迭代器是一种设计模式：**提供一种统一的方式顺序访问聚合对象中的元素，而不暴露其内部表示**。

- 所有实现了 `Collection` 接口的集合，都有 `iterator()` 方法返回一个迭代器；
- 迭代器只负责遍历，本身不存放元素；
- 它屏蔽了不同集合的内部结构差异——同一套遍历代码可用于 `ArrayList`、`LinkedList`、`HashSet` 等。

这一切的基础是两个接口。`Collection` 继承自 `Iterable`：

```java
public interface Iterable<T> {
    Iterator<T> iterator();   // 返回一个迭代器
}
```

```java
public interface Iterator<E> {
    boolean hasNext();        // 是否还有下一个元素
    E next();                 // 返回当前元素并后移
    default void remove() {   // 删除上一次 next() 返回的元素（可选操作）
        throw new UnsupportedOperationException("remove");
    }
}
```

| 方法 | 作用 |
|---|---|
| `hasNext()` | 判断是否还有元素，`true` 表示还能继续遍历 |
| `next()` | 返回当前元素并把游标后移一位 |
| `remove()` | 删除上一次 `next()` 返回的元素 |

> 习惯用法：先 `hasNext()` 判断、再 `next()` 取值。若不判断就调用 `next()`，没有元素时会抛 `NoSuchElementException`。

## 三、用迭代器遍历集合

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class TestDemo {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>();
        list.add(111);
        list.add(222);
        list.add(333);

        Iterator<Integer> iterator = list.iterator();
        while (iterator.hasNext()) {
            int value = iterator.next();
            System.out.print(value + " ");
        }
    }
}
```

执行过程：`hasNext()` 判断是否还有元素 → `next()` 返回当前元素并后移，循环直到 `hasNext()` 返回 `false`。

## 四、迭代器的 remove()

要在遍历中删除元素，应使用**迭代器自己的** `remove()`，而不是集合的 `remove()`：

```java
Iterator<Integer> iterator = list.iterator();
while (iterator.hasNext()) {
    Integer value = iterator.next();
    if (value == 111) iterator.remove();   // 正确：用迭代器的 remove
}
```

## 五、fail-fast：为什么遍历时用集合的 remove() 会抛异常（面试高频）

如果在迭代过程中调用**集合的** `remove()` / `add()`：

```java
Iterator<Integer> iterator = list.iterator();
while (iterator.hasNext()) {
    Integer value = iterator.next();
    if (value == 111) list.remove(Integer.valueOf(111));  // 错误：用集合的 remove
}
```

会抛出 `java.util.ConcurrentModificationException`。原因在 `modCount` 与 `expectedModCount` 的对账机制（fail-fast 快速失败）：

- `modCount`：集合的"修改版本号"，每次增删都会 `+1`；
- `expectedModCount`：迭代器创建时记下的 `modCount` 快照；
- 每次 `next()` 都会调用 `checkForComodification()`，比较两者是否相等，不等就抛异常。

一步步走（初始 `add` 三次后 `modCount = 3, size = 3`）：

1. 创建迭代器：`expectedModCount = modCount = 3`，`cursor = 0`，`lastRet = -1`；
2. `hasNext()`（`cursor != size`）成立，进入循环；
3. `next()` 校验 `modCount == expectedModCount`（3 == 3）通过，返回元素，`lastRet = 0, cursor = 1`；
4. 调用**集合的** `remove()`：`modCount` 变成 4、`size` 变成 2，但 `expectedModCount` 仍是 3；
5. 再次 `hasNext()` 成立，进入循环；
6. `next()` 校验：`modCount(4) != expectedModCount(3)`，**抛 `ConcurrentModificationException`**。

关键区别：**迭代器的** `remove()` 删除后会执行 `expectedModCount = modCount`，把两者重新同步，所以不抛异常；而**集合的** `remove()` 不会同步迭代器的 `expectedModCount`，于是对账失败。

> fail-fast 是单线程下的保护：它只是尽早发现"遍历期间结构被改"的问题，**并不保证多线程安全**。多线程并发修改集合仍不安全。

## 六、增强 for 循环

增强 for（for-each）本质是迭代器的语法糖，编译后底层仍是 `Iterator`，只能用于遍历集合或数组：

```java
List<Integer> list = new ArrayList<>();
list.add(111); list.add(222); list.add(333);

for (Integer i : list) {        // 等价于用 iterator 遍历
    System.out.print(i + " ");
}

int[] arr = {1, 2, 3, 4, 5, 6};
for (int i : arr) {             // 数组也支持
    System.out.print(i + " ");
}
```

正因为底层是迭代器，**在增强 for 里调用集合的增删方法，同样会触发 `ConcurrentModificationException`**。

## 七、迭代器遍历的优缺点

**优点**：屏蔽集合内部结构、同一套代码遍历不同集合、降低耦合、支持多种遍历方式（如 `ListIterator` 可正向/反向）。

**缺点**：需额外创建迭代器对象；每取一个元素要调用 `hasNext()` + `next()` 两个方法；遍历中改结构容易触发异常。

## 八、遍历时确实要增删怎么办

- 用**迭代器自己的** `remove()`（只能删，不能增）；
- 或用 `ListIterator`：除删除外还能 `add()`、`set()` 修改元素，但只适用于 `List`，且需从指定位置开始遍历。
