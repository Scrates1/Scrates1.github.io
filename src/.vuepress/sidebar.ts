import { sidebar } from "vuepress-theme-hope";

// 每个分类目录用 "structure" 自动按文件生成侧边栏：
// 以后往对应目录丢 .md（带数字前缀控制顺序）即可，无需手动维护。
export default sidebar({
  "/compilation/": "structure",
  "/java/": "structure",
  "/data/": "structure",
  "/operating_system/": "structure",
  "/tips/": "structure",
  "/resources/": "structure",
  "/about/": "structure",
  "/博客/": "structure",
});
