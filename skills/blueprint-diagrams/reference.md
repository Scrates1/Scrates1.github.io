# 暖调蓝图配图参考

## 语义 class

`.mmd` 写左边名字；渲染器注入颜色。`aux` 自动虚线框。

| class | 含义 | 观感（日间） |
|-------|------|----------------|
| `statement` | 普通步骤 / 默认节点 | 蓝灰描边、浅底 |
| `branch` | 条件、分叉；`field` 同色 | 橙褐 |
| `merge` | 汇合、结论、强调根 | 绿 |
| `object` | 实体 / 堆对象 / 偏「蓝」的块 | 淡蓝底 |
| `field` | 从属槽位 | 同 branch |
| `note` | 输入、输出、说明 | 灰褐底 |
| `aux` | 次要、排除、辅助 | 虚线框 |

未挂 class → `default`（= statement）。

正文若写颜色图例（蓝/绿/橙/灰），必须与上表一致。

### 专题别名（静态分析 02 篇等）

`front`→object（蓝），`mid`→merge（绿），`back`→branch（橙），`block`→statement，`note`→note。其他栏目一般不用。

## 边

| 语法 | 用途 |
|------|------|
| `-->` | 主流程、调用、普通传播 |
| `-.->` | 约束、旁路、比较、排除 |
| `==>` | 强调（指向、关键路径） |
| `---` | 从属等细线无箭头 |

不要用 `linkStyle` 上色。

## 图类型

| type | 间距（node / rank） | 备注 |
|------|---------------------|------|
| `overview` | 30 / 48 | 总览 flowchart |
| `tree` | 20 / 56 | 列左对齐 + 直角连线 |
| `process` | 35 / 45 | 默认首选之一 |
| `cfg` | 40 / 45 | 控制流 / 调用 |
| `lattice` | 40 / 50 | 静态分析：格 |
| `ifds` | 40 / 55 | 静态分析：ESG |
| `points-to` | 40 / 60 | 静态分析：指向 |

新栏目优先 `process` / `cfg` / `overview` / `tree`。

## 宽度

正文栏约 764px。SVG 天然宽度宜 ≤ ~800。横向长链改 `TB` 或折行标签。

## 标签

- 双引号：`#quot;…#quot;`
- ①–⑳：直接 Unicode（后处理换中文字体）
- 子图标题会抬到上层并加底色描边

## 渲染 CLI

```bash
node scripts/render_named_diagrams.cjs [--dir <assets相对仓库根>] [--all|<name>…]
```

- 默认 `--dir`：`src/static-analysis/assets`
- 该目录必须有 `diagram-manifest.json`，且每个 `.mmd` 都已登记

## 报错对照

| 报错 | 处理 |
|------|------|
| `sets its own colours` | 删色值，改挂语义 class |
| `HTML entity such as &quot;` | 改用 `#quot;` |
| `not in diagram-manifest.json` | 先登记 type |
| `tree: no room for a trunk` | 加大 `tree` 的 rankSpacing 或简化结构 |

## 管线

```
.mmd → 注入 classDef / 处理 #quot;
    → Mermaid（量字字体 + SVG text）
    → 后处理（画板网格、居中、行距、tree 直角线、显示字体）
    → <name>.svg + <name>.dark.svg
```

- `scripts/render_named_diagrams.cjs`
- `scripts/diagram-style/tokens.cjs`
- `scripts/diagram-style/blueprint-theme.cjs`
- `scripts/diagram-style/svg-postprocess.cjs`

## 范例（静态分析落地）

| 文件 | 看点 |
|------|------|
| `src/static-analysis/assets/07-series-0.mmd` | process + note/branch/merge |
| `src/static-analysis/assets/02-05-jimple-cfg.mmd` | statement / branch / merge |
| `src/static-analysis/assets/00-series-1.mmd` | tree |
| `src/static-analysis/assets/11-series-1.mmd` | object / field、粗细虚实边 |
