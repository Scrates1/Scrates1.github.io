# Scrates1.github.io

VuePress 2 + vuepress-theme-hope 博客。`src/` 是站点源，push 到 `main` 后由 GitHub Actions 构建到 `gh-pages`。本地：`yarn install --frozen-lockfile`，`yarn docs:dev` 预览，`yarn docs:build` 构建（需 `NODE_OPTIONS=--max_old_space_size=8192`）。

## 技术配图（全站）

暖调蓝图风格：画板网格、等宽字体、语义 class、日夜各一张 SVG。完整流程见 `skills/blueprint-diagrams/`（通用 Agent Skill，各家 AI 可读）。

- 图源与产物放在文章旁的 `assets/`：`<name>.mmd` → `<name>.svg` + `<name>.dark.svg`；先在同目录 `diagram-manifest.json` 登记类型。
- `.mmd` 只写结构和语义 class，不写色值；配色与字体在 `scripts/diagram-style/`。
- 渲染：`node scripts/render_named_diagrams.cjs [--dir <assets>] <name>|--all`，目检 `%TEMP%\<name>.png` 与 `.dark.png`。默认 `--dir` 为 `src/static-analysis/assets`。
- 正文：`![图注](assets/<name>.svg#light)`，空一行，`![图注](assets/<name>.dark.svg#dark)`，图注相同。

## 静态分析系列（课程）

- 正文与术语表：`src/static-analysis/`，英文 slug 文件名、中文标题、自带 frontmatter。总览 `README.md` 是分类首页。
- 图：`src/static-analysis/assets/`，约定见上节；配图细节同样遵循 `skills/blueprint-diagrams/`。
- 示例工程：`examples/static-analysis/`（Maven + Soot 4.7.1 + JDK 11），不参与构建。
- 规划与审阅记录：`notes/static-analysis/`，不参与构建。写作约束在 `静态分析系列规划.md` 第 6 节，目录与工作流在第 9 节。
- 每次改动正文后运行 `python scripts/check_series.py`；新增篇目时同步更新 README 表格和脚本中的篇数断言。

## 约束

- 编辑 Markdown 只用编辑器/编辑工具做定点修改，不用 shell 批量替换（曾因此损坏三篇正文）。
- 不把有版权的 PDF 入库。
- 提交署名使用仓库级 git 配置，不改全局 git 配置。
