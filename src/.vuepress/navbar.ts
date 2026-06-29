import { navbar } from "vuepress-theme-hope";

// 各分类无 README.md，故 navbar 链到每类首篇文章，避免 404。
export default navbar([
  "/",
  { text: "编译", link: "/compilation/03lexical_analysis.html" },
  { text: "Java", link: "/java/01java_basic_knowledge.html" },
  {
    text: "更多",
    children: [
      { text: "数据/中间件", link: "/data/01does_the_database_primary_key_have_to_be_auto-incremented.html" },
      { text: "操作系统", link: "/operating_system/01memory_leak.html" },
      { text: "技巧", link: "/tips/01UUID.html" },
      { text: "资源", link: "/resources/tools.html" },
    ],
  },
  { text: "分类", link: "/category/" },
  { text: "时间线", link: "/timeline/" },
  { text: "关于", link: "/about/about_blog.html" },
]);
