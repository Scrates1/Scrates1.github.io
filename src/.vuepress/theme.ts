import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://Scrates1.github.io",

  author: {
    name: "远起",
    url: "https://Scrates1.github.io",
  },

  favicon: "/favicon.ico",

  // 减少主题默认装饰，整体更干净
  pure: true,

  // 保持导航和两侧目录清晰，关闭纯净模式默认启用的专注效果
  focus: false,

  print: false,

  // 显示全屏图标
  fullscreen: true,

  logo: "/logo.jpg",

  // 导航栏 GitHub 图标指向个人主页；「编辑此页」仍走 docsRepo 指向本站仓库
  repo: "https://github.com/Scrates1",

  docsRepo: "Scrates1/Scrates1.github.io",

  docsBranch: "main",

  docsDir: "src",

  blog: {
    timeline: "时光印记",

    medias: {
      GitHub: "https://github.com/Scrates1",
    },
    avatar: "/avatar.jpg",
    roundAvatar: true,
    //每页文章数量
    articlePerPage: 10,
  },

  locales: {
    /**
     * Chinese locale config
     */
    "/": {
      // navbar
      navbar: navbar,

      // sidebar
      sidebar: sidebar,
      // 原 headerDepth: 4
      toc: {
        levels: [2, 4],
      },

      //footer: '<a href="https://beian.miit.gov.cn/">鲁ICP备2021042179号-1</a>',

      copyright:
        '<a href="https://beian.miit.gov.cn/">鲁ICP备2021042179号-1</a> | Copyright © 2022-present | 远起',

      displayFooter: true,

      blog: {
        description: "蜉蝣天地，且行且喜",
        intro: "/intro.html",
      },

      // page meta
      metaLocales: {
        editLink: "在 GitHub 上编辑此页",
      },
    },
  },

  encrypt: {
    config: {
      "/demo/encrypt.html": {
        password: "1234",
      },
    },
  },

  // 只开站点实际用到的 Markdown 能力；cjkFriendly 修中文加粗边界
  markdown: {
    align: true,
    cjkFriendly: true,
    figure: true,
    gfm: true,
    hint: true,
    imgLazyload: true,
    // ![](a.svg#light) / ![](a.dark.svg#dark)：按站点日夜主题切换图片
    imgMark: true,
    imgSize: true,
    mark: true,
    sub: true,
    sup: true,
    tasklist: true,
    vPre: true,
    revealjs: {
      plugins: ["highlight", "math", "search", "notes", "zoom"],
    },
  },

  plugins: {
    blog: true,

    icon: {
      assets: "fontawesome",
    },

    // If you don’t need comment feature, you can remove following option
    // The following config is for demo ONLY, if you need comment feature, please generate and use your own config, see comment plugin documentation for details.
    // To avoid disturbing the theme developer and consuming his resources, please DO NOT use the following config directly in your production environment!!!!!
    comment: {
      /**
       * Using Giscus
       */
      provider: "Giscus",
      repo: "Scrates1/vuepress-hope-blog-Discussion",
      repoId: "R_kgDOJF79Xg",
      //category: "Announcements",
      category: "General",
      categoryId: "DIC_kwDOJF79Xs4CUrl2",
    },
  },
});
