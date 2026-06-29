import { defineUserConfig } from "vuepress";
import theme from "./theme.js";


export default defineUserConfig({

  base: "/",

  lang: "zh-CN",


  locales: {
    "/": {
      lang: "zh-CN",
      title: "秋迟先生",
      description: "计算机相关知识",

    },
    },


  theme,

  shouldPrefetch: false,

  // 暂不发布：编译系列 01/02 是 MOOC 课件截图笔记（版权 + 非原创），
  // 排除出构建，文件保留在 src 下作私人笔记。要发布时删掉对应排除项即可。
  pagePatterns: [
    "**/*.md",
    "!.vuepress",
    "!node_modules",
    "!compilation/01introduction.md",
    "!compilation/02high-level_programming_language.md",
  ],
});
