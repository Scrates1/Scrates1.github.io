import{_ as l}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o,c as r,a as n,b as s,e,d as i,f as t}from"./app-b18b2fe8.js";const d="/assets/image-20230203165049392-5d8a6c9d.png",u="/assets/image-20230203171412751-15e2e783.png",v="/assets/image-20230203212938398-00e33caf.png",m="/assets/image-20230203224959450-116b7185.png",k="/assets/image-20230208224902142-cdb39b80.png",p="/assets/image-20230211165713797-2e9f77d7.png",b="/assets/image-20230211144807893-2a96fdad.png",g="/assets/image-20230211170450287-a2933553.png",h="/assets/image-20230211144839987-e0e9ffee.png",f="/assets/image-20230211152533007-68c665df.png",_="/assets/image-20230211152839991-be13b69d.png",y="/assets/image-20230211154015584-d6ec2803.png",w={},x=n("h1",{id:"建站参考",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#建站参考","aria-hidden":"true"},"#"),s(" 建站参考")],-1),q=n("p",null,"今舍弃 hexo 的博客，改为使用 vuepress。 具体使用 vuepress-theme-hope 版本。",-1),z=n("h2",{id:"官方教程",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#官方教程","aria-hidden":"true"},"#"),s(" 官方教程")],-1),$={href:"https://vuepress-theme-hope.github.io/v2/zh/guide/",target:"_blank",rel:"noopener noreferrer"},j={href:"https://v2.vuepress.vuejs.org/",target:"_blank",rel:"noopener noreferrer"},N=t(`<h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装" aria-hidden="true">#</a> 安装</h2><div class="language-yarn line-numbers-mode" data-ext="yarn"><pre class="language-yarn"><code>yarn create vuepress-theme-hope my-blog
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="本地启动" tabindex="-1"><a class="header-anchor" href="#本地启动" aria-hidden="true">#</a> 本地启动</h2><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yarn docs:dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="项目打包" tabindex="-1"><a class="header-anchor" href="#项目打包" aria-hidden="true">#</a> 项目打包</h2><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">yarn</span> docs:build
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>打包完可以在<code>src\\.vuepress</code> 看到文件夹 <code>dist</code>。</p><h2 id="更新到仓库" tabindex="-1"><a class="header-anchor" href="#更新到仓库" aria-hidden="true">#</a> 更新到仓库</h2><p>使用 <code>shell</code> 脚本将打包后的文件（src.vuepress\\dist文件夹下的文件）更新到 Gitee仓库。（此脚本包含打包，以后修改完不用再手动打包了）</p>`,9),P=t(`<div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token shebang important">#!/usr/bin/env sh</span>

<span class="token comment"># 确保脚本抛出遇到的错误</span>
<span class="token builtin class-name">set</span> <span class="token parameter variable">-e</span>
<span class="token comment"># 生成静态文件</span>
<span class="token function">yarn</span> docs:build

<span class="token comment">#上传</span>
<span class="token comment"># git add -A</span>
<span class="token comment"># git commit -m &#39;上传&#39;</span>
<span class="token comment"># git push origin master</span>


<span class="token comment"># 进入生成的文件夹</span>
<span class="token builtin class-name">cd</span> src/.vuepress/dist

<span class="token comment"># 如果是发布到自定义域名</span>
<span class="token comment"># echo &#39;www.example.com&#39; &gt; CNAME</span>

<span class="token function">git</span> init
<span class="token function">git</span> <span class="token function">add</span> <span class="token parameter variable">-A</span>
<span class="token function">git</span> commit <span class="token parameter variable">-m</span> <span class="token string">&#39;deploy&#39;</span>
<span class="token function">git</span> remote <span class="token function">add</span> gitee https://gitee.com/<span class="token punctuation">..</span>.

<span class="token function">git</span> push  <span class="token parameter variable">--force</span> gitee master

<span class="token builtin class-name">cd</span> -

<span class="token builtin class-name">echo</span> 按任意键继续
<span class="token builtin class-name">read</span> <span class="token parameter variable">-n</span> <span class="token number">1</span>
<span class="token builtin class-name">echo</span> 继续运行
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>备份： 在 github 仓库备份原文档。</p><h2 id="部署" tabindex="-1"><a class="header-anchor" href="#部署" aria-hidden="true">#</a> 部署</h2><h3 id="宝塔下运行" tabindex="-1"><a class="header-anchor" href="#宝塔下运行" aria-hidden="true">#</a> 宝塔下运行</h3><p>环境：Ubuntu 22.04</p>`,5),A={href:"https://www.bt.cn/new/index.html",target:"_blank",rel:"noopener noreferrer"},E=t('<p>宝塔上安装：</p><ul><li>Nginx/Apache（根据个人需求任意安装一个，用于反向代理做域名绑定或80端口访问使用）</li><li>Node.js</li><li>Node.js设置（**很重要：命令运行版本默认状态是：未设置，这里我们需要选择一下版本，否则后面安装vuepress无法使用命令行模式。**registy源默认使用 官方源 即可）</li></ul><figure><img src="'+d+'" alt="image-20230203165049392" tabindex="0" loading="lazy"><figcaption>image-20230203165049392</figcaption></figure><p>建站：<br><img src="'+u+`" alt="image-20230203171412751" loading="lazy"></p><p>删除网站对应根目录（/www/wwwroot/vuepressblog）下所有文件，在/www/wwwroot/vuepressblog下右键打开终端，克隆gitee上的项目：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> clone https://gitee.com/<span class="token punctuation">..</span>.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><hr><p><strong>一些问题：</strong></p><ul><li>一切就绪后访问网站时：</li></ul><figure><img src="`+v+'" alt="image-20230203212938398" tabindex="0" loading="lazy"><figcaption>image-20230203212938398</figcaption></figure>',10),S={href:"https://www.bt.cn/bbs/forum.php?mod=viewthread&tid=72173&highlight=nginx%2B403",target:"_blank",rel:"noopener noreferrer"},C=n("ul",null,[n("li",null,"若想要nginx 配置位置：（此项目不需要）")],-1),D=n("figure",null,[n("img",{src:m,alt:"image-20230203224959450",tabindex:"0",loading:"lazy"}),n("figcaption",null,"image-20230203224959450")],-1),R=n("h3",{id:"webhook-设置",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#webhook-设置","aria-hidden":"true"},"#"),s(" webhook 设置")],-1),T={href:"https://blog.csdn.net/qq_40025218/article/details/115376472",target:"_blank",rel:"noopener noreferrer"},B=n("p",null,"当你修改本地文件后，想要网站上的内容自动更新怎么办？",-1),V=n("p",null,"可以使用webhook。当gitee上有push操作时，宝塔自动执行脚本，从gitee上拉取最新的文件。",-1),G=t(`<p>脚本：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token builtin class-name">cd</span> /www/wwwroot/vuepressblog/vuepressblogdist<span class="token punctuation">;</span>

<span class="token comment">#git pull 来从远程仓库拉取同步代码</span>
<span class="token comment">## 注意宝塔好像无法识别&amp;&amp;后的指令，只执行了fetch，所以在宝塔上分开写</span>
<span class="token comment">#git fetch --all &amp;&amp; git reset --hard origin/master &amp;&amp; git pull</span>
<span class="token function">git</span> fetch --all<span class="token punctuation">;</span> 
<span class="token function">git</span> reset <span class="token parameter variable">--hard</span> origin/master<span class="token punctuation">;</span>
<span class="token function">git</span> pull<span class="token punctuation">;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><figure><img src="`+k+`" alt="image-20230208224902142" tabindex="0" loading="lazy"><figcaption>image-20230208224902142</figcaption></figure><p>或</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;&quot;</span>
<span class="token comment">#输出当前时间</span>
<span class="token function">date</span> <span class="token parameter variable">--date</span><span class="token operator">=</span><span class="token string">&#39;0 days ago&#39;</span> <span class="token string">&quot;+%Y-%m-%d %H:%M:%S&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;Start&quot;</span>
<span class="token comment">#判断宝塔WebHook参数是否存在</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token operator">!</span> <span class="token parameter variable">-n</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span>
<span class="token keyword">then</span>
          <span class="token builtin class-name">echo</span> <span class="token string">&quot;param参数错误&quot;</span>
          <span class="token builtin class-name">echo</span> <span class="token string">&quot;End&quot;</span>
          <span class="token builtin class-name">exit</span>
<span class="token keyword">fi</span>
<span class="token comment">#git项目路径</span>
<span class="token assign-left variable">gitPath</span><span class="token operator">=</span><span class="token string">&quot;/www/wwwroot/...&quot;</span>
<span class="token comment">#git 网址</span>
<span class="token assign-left variable">gitHttp</span><span class="token operator">=</span><span class="token string">&quot;https://gitee.com/...&quot;</span>

<span class="token builtin class-name">echo</span> <span class="token string">&quot;Web站点路径：<span class="token variable">$gitPath</span>&quot;</span>
 
<span class="token comment">#判断项目路径是否存在</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token parameter variable">-d</span> <span class="token string">&quot;<span class="token variable">$gitPath</span>&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
        <span class="token builtin class-name">cd</span> <span class="token variable">$gitPath</span>
        <span class="token comment">#判断是否存在git目录</span>
        <span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token operator">!</span> <span class="token parameter variable">-d</span> <span class="token string">&quot;.git&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
                <span class="token builtin class-name">echo</span> <span class="token string">&quot;在该目录下克隆 git&quot;</span>
                <span class="token function">git</span> clone <span class="token variable">$gitHttp</span> gittemp
                <span class="token function">mv</span> gittemp/.git <span class="token builtin class-name">.</span>
               <span class="token function">rm</span> <span class="token parameter variable">-rf</span> gittemp
        <span class="token keyword">fi</span>
        <span class="token comment">#强制拉取最新的项目文件</span>
        <span class="token function">git</span> fetch <span class="token parameter variable">--all</span>
        <span class="token function">git</span> reset <span class="token parameter variable">--hard</span> origin/master
        <span class="token function">git</span> pull origin master
        <span class="token comment">#设置目录权限</span>
        <span class="token function">chown</span> <span class="token parameter variable">-R</span> www:www <span class="token variable">$gitPath</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;End&quot;</span>
        <span class="token builtin class-name">exit</span>
<span class="token keyword">else</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;该项目路径不存在&quot;</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;End&quot;</span>
        <span class="token builtin class-name">exit</span>
<span class="token keyword">fi</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>注意有时修改内容后<strong>重启宝塔</strong>才会生效：</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># bt restart</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></blockquote><p>然后再对gitee进行webhook配置。</p><h2 id="配置阿里云dns" tabindex="-1"><a class="header-anchor" href="#配置阿里云dns" aria-hidden="true">#</a> 配置阿里云DNS</h2><p>保证网站从 github 拉取代码的网速，配置上了阿里云 DNS。</p>`,9),H={href:"https://alidns.com/knowledge?type=SETTING_DOCS#user_linux",target:"_blank",rel:"noopener noreferrer"},I=n("h2",{id:"右侧目录",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#右侧目录","aria-hidden":"true"},"#"),s(" 右侧目录")],-1),L=n("h3",{id:"适用-vuepress2",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#适用-vuepress2","aria-hidden":"true"},"#"),s(" 适用 vuepress2")],-1),M={href:"https://www.npmjs.com/package/vuepress-plugin-anchor-right",target:"_blank",rel:"noopener noreferrer"},O=t(`<ul><li>安装</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yarn add -D vuepress-plugin-anchor-right
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>指定目录版本：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yarn add -D vuepress-plugin-anchor-right@0.0.1-beta.7
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>引入</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// docs/.vuepress/config.js</span>
<span class="token keyword">const</span> vuepressPluginAnchorRight <span class="token operator">=</span> <span class="token function">require</span> <span class="token punctuation">(</span><span class="token string">&#39;vuepress-plugin-anchor-right&#39;</span><span class="token punctuation">)</span> <span class="token punctuation">;</span>

module<span class="token punctuation">.</span>exports <span class="token operator">=</span> <span class="token punctuation">{</span>
  <span class="token operator">...</span><span class="token punctuation">,</span>
  <span class="token literal-property property">plugins</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">[</span><span class="token function">vuepressPluginAnchorRight</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>或</p><div class="language-typescript line-numbers-mode" data-ext="ts"><pre class="language-typescript"><code><span class="token comment">// docs/.vuepress/config.ts</span>
<span class="token keyword">import</span> vuepressPluginAnchorRight <span class="token keyword">from</span> <span class="token string">&#39;vuepress-plugin-anchor-right&#39;</span><span class="token punctuation">;</span>

<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>
  <span class="token operator">...</span><span class="token punctuation">,</span>
  plugins<span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">[</span><span class="token function">vuepressPluginAnchorRight</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>卸载目录：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>yarn remove vuepress-plugin-anchor-right
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="适用-vuepress-theme-hope" tabindex="-1"><a class="header-anchor" href="#适用-vuepress-theme-hope" aria-hidden="true">#</a> 适用 vuepress-theme-hope</h3><h4 id="分析" tabindex="-1"><a class="header-anchor" href="#分析" aria-hidden="true">#</a> 分析</h4><p>当我使用小屏笔记本的时候，发现文章目录都在左侧，显得很臃肿。就像下面：</p><figure><img src="`+p+'" alt="image-20230211165713797" tabindex="0" loading="lazy"><figcaption>image-20230211165713797</figcaption></figure><p>在官网上只找到 sidebar 开关或者设置 headerDepth，但前者是关闭侧边栏，后者是控制目录层深，无法解决问题。</p><p>于是 F12，大屏电脑，右侧是 toc：</p><figure><img src="'+b+'" alt="image-20230211144807893" tabindex="0" loading="lazy"><figcaption>image-20230211144807893</figcaption></figure><p>用上面的 <code>toc-list</code> 去 <code>node_modules</code> 目录下搜索，最后找到了 <code>renderChildren</code>：</p><figure><img src="'+g+'" alt="image-20230211170450287" tabindex="0" loading="lazy"><figcaption>image-20230211170450287</figcaption></figure><p>再用 <code>renderChildren</code>，找到了生成 html 里 <code>toc-list</code> 的地方：</p><figure><img src="'+h+'" alt="image-20230211144839987" tabindex="0" loading="lazy"><figcaption>image-20230211144839987</figcaption></figure><p>注释掉上面试了一下，的确是这个位置无误。</p><hr><p>那如何达到我的小屏幕电脑，目录也在右侧显示的目的呢？</p><p>我们可以发现，小屏电脑左侧标签是 <code>sidebar-sub-header</code>。</p><figure><img src="'+p+'" alt="image-20230211165713797" tabindex="0" loading="lazy"><figcaption>image-20230211165713797</figcaption></figure><p>打开生成的 dist 下生成的 html 文件，发现 <code>sidebar-sub-header</code> 与 <code>toc-list</code> 标签皆存在。所以很大可能就是因为 <code>css</code> 根据不同屏幕对其的控制了。</p><p>在 <code>node_modules</code> 下搜索 <code>toc-list</code>，果然找到了 <code>toc.scss</code> 文件：</p><figure><img src="'+f+`" alt="image-20230211152533007" tabindex="0" loading="lazy"><figcaption>image-20230211152533007</figcaption></figure><div class="language-scss line-numbers-mode" data-ext="scss"><pre class="language-scss"><code>  <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> hope-config.<span class="token variable">$pc</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
    <span class="token selector">.has-toc <span class="token parent important">&amp;</span> </span><span class="token punctuation">{</span>
      <span class="token property">display</span><span class="token punctuation">:</span> block<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>上面的意思是媒体尺寸大于 <code>hope-config.$pc</code> 时，以block格式显示。</p></blockquote><p>再搜索 <code>sidebar-sub-header</code>，可以看到这里控制着当右侧目录显示时，就不显示 <code>sidebar-sub-header</code>。</p><figure><img src="`+_+'" alt="image-20230211152839991" tabindex="0" loading="lazy"><figcaption>image-20230211152839991</figcaption></figure><p>那么 <code>hope-config.$pc</code> 又是啥？</p><figure><img src="'+y+`" alt="image-20230211154015584" tabindex="0" loading="lazy"><figcaption>image-20230211154015584</figcaption></figure><p>至此就很明晰了，小屏电脑都在左侧是因为它的尺寸小于 <code>1440px</code>，而大屏电脑则大于这个数值。</p><h4 id="设置" tabindex="-1"><a class="header-anchor" href="#设置" aria-hidden="true">#</a> 设置</h4><p>最终在 <code>src\\.vuepress\\styles\\index.scss</code> 设置如下：</p><div class="language-scss line-numbers-mode" data-ext="scss"><pre class="language-scss"><code><span class="token comment">// place your custom styles here</span>
<span class="token comment">// desktop</span>
<span class="token property"><span class="token variable">$laptop</span></span><span class="token punctuation">:</span> 1280px <span class="token punctuation">;</span>
<span class="token selector">#toc </span><span class="token punctuation">{</span>

  
    <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
      <span class="token selector">.has-toc <span class="token parent important">&amp;</span> </span><span class="token punctuation">{</span>
        <span class="token property">display</span><span class="token punctuation">:</span> block<span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  
    <span class="token atrule"><span class="token rule">@media</span> print</span> <span class="token punctuation">{</span>
      <span class="token property">display</span><span class="token punctuation">:</span> none <span class="token important">!important</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">.sidebar-links </span><span class="token punctuation">{</span>
    <span class="token selector">ul </span><span class="token punctuation">{</span>
  
      <span class="token selector"><span class="token parent important">&amp;</span>.sidebar-sub-headers </span><span class="token punctuation">{</span>
  
        <span class="token selector">.has-toc <span class="token parent important">&amp;</span> </span><span class="token punctuation">{</span>
          <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
            <span class="token property">display</span><span class="token punctuation">:</span> none<span class="token punctuation">;</span>
          <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">.sidebar </span><span class="token punctuation">{</span>
    <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
        <span class="token property">box-shadow</span><span class="token punctuation">:</span> none<span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">.theme-container </span><span class="token punctuation">{</span>
  
    <span class="token selector"><span class="token parent important">&amp;</span>.has-toc .page.blog </span><span class="token punctuation">{</span>
      <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
        <span class="token comment">// fix toc padding</span>
        <span class="token property">padding-inline-end</span><span class="token punctuation">:</span> 0<span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">.toggle-sidebar-wrapper </span><span class="token punctuation">{</span>

    <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
      <span class="token property">display</span><span class="token punctuation">:</span> none<span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token selector">.theme-container </span><span class="token punctuation">{</span>
  
    <span class="token selector">.page </span><span class="token punctuation">{</span>
    
  
      <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
        <span class="token property">padding-inline-end</span><span class="token punctuation">:</span> <span class="token function">calc</span><span class="token punctuation">(</span>
          100vw <span class="token operator">-</span> <span class="token function">var</span><span class="token punctuation">(</span>--content-width<span class="token punctuation">)</span> <span class="token operator">-</span> <span class="token function">var</span><span class="token punctuation">(</span>--sidebar-space<span class="token punctuation">)</span> <span class="token operator">-</span> 6rem
        <span class="token punctuation">)</span><span class="token punctuation">;</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token comment">// sidebar is disabled</span>
    <span class="token selector"><span class="token parent important">&amp;</span>.no-sidebar </span><span class="token punctuation">{</span>

        <span class="token selector"><span class="token parent important">&amp;</span>.has-toc </span><span class="token punctuation">{</span>
        <span class="token selector">.page </span><span class="token punctuation">{</span>
            <span class="token comment">// add padding for anchor</span>
            <span class="token atrule"><span class="token rule">@media</span> <span class="token punctuation">(</span><span class="token property">min-width</span><span class="token punctuation">:</span> <span class="token variable">$laptop</span><span class="token punctuation">)</span></span> <span class="token punctuation">{</span>
            <span class="token property">padding-inline-end</span><span class="token punctuation">:</span> 16rem<span class="token punctuation">;</span>
            <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="自定义" tabindex="-1"><a class="header-anchor" href="#自定义" aria-hidden="true">#</a> 自定义</h3>`,40),W={href:"https://zhuanlan.zhihu.com/p/361897932",target:"_blank",rel:"noopener noreferrer"},F=t(`<h2 id="图片" tabindex="-1"><a class="header-anchor" href="#图片" aria-hidden="true">#</a> 图片</h2><h3 id="适用-vuepress2-1" tabindex="-1"><a class="header-anchor" href="#适用-vuepress2-1" aria-hidden="true">#</a> 适用 vuepress2</h3><p>修改 docs/.vuepress/config.ts 配置文件</p><ul><li>设置 head 属性，添加 link 标签，href 设置图片路径。</li><li><strong>注意：图片放在 docs/.vuepress/public 文件夹下，public 要手动创建</strong>。</li><li>编译后 dist 文件夹会将 public 文件夹下的文件放出。</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">import</span> <span class="token punctuation">{</span> defaultTheme <span class="token punctuation">}</span> <span class="token keyword">from</span> <span class="token string">&#39;vuepress&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">import</span> vuepressPluginAnchorRight <span class="token keyword">from</span> <span class="token string">&#39;vuepress-plugin-anchor-right&#39;</span><span class="token punctuation">;</span>


<span class="token keyword">export</span> <span class="token keyword">default</span> <span class="token punctuation">{</span>

  <span class="token literal-property property">plugins</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">[</span><span class="token function">vuepressPluginAnchorRight</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">lang</span><span class="token operator">:</span> <span class="token string">&#39;zh-CN&#39;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;秋迟先生&#39;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">description</span><span class="token operator">:</span> <span class="token string">&#39;有趣的知识库&#39;</span><span class="token punctuation">,</span>
  <span class="token literal-property property">head</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">[</span>
    <span class="token comment">// 设置 favor.ico，.vuepress/public 下</span>
        <span class="token string">&#39;link&#39;</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">rel</span><span class="token operator">:</span> <span class="token string">&#39;icon&#39;</span><span class="token punctuation">,</span> <span class="token literal-property property">href</span><span class="token operator">:</span> <span class="token string">&#39;/images/avatar.jpg&#39;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token literal-property property">theme</span><span class="token operator">:</span> <span class="token function">defaultTheme</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 默认主题配置</span>
    <span class="token literal-property property">logo</span><span class="token operator">:</span> <span class="token string">&#39;/images/avatar.jpg&#39;</span><span class="token punctuation">,</span>
    <span class="token operator">...</span>
  <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5);function U(Y,J){const a=c("ExternalLinkIcon");return o(),r("div",null,[x,q,z,n("p",null,[s("vuepress-theme-hope："),n("a",$,[s("https://vuepress-theme-hope.github.io/v2/zh/guide/"),e(a)])]),n("p",null,[s("vuepress 2："),n("a",j,[s("https://v2.vuepress.vuejs.org/"),e(a)])]),N,i(" 截图已遗失 "),P,n("p",null,[s("安装宝塔："),n("a",A,[s("https://www.bt.cn/new/index.html"),e(a)])]),E,n("blockquote",null,[n("p",null,[s("解决参考："),n("a",S,[s("https://www.bt.cn/bbs/forum.php?mod=viewthread&tid=72173&highlight=nginx%2B403"),e(a)])]),i(" 截图已遗失 ")]),C,D,R,n("blockquote",null,[n("p",null,[s("参考："),n("a",T,[s("宝塔webhook与Gitee配置实现服务器的代码同步更新"),e(a)])])]),B,V,i(" 截图已遗失 "),G,n("p",null,[n("a",H,[s("https://alidns.com/knowledge?type=SETTING_DOCS#user_linux"),e(a)])]),I,L,n("p",null,[s("链接："),n("a",M,[s("https://www.npmjs.com/package/vuepress-plugin-anchor-right"),e(a)])]),O,n("p",null,[s("如果想自己生成右侧目录，可以参考这个链接："),n("a",W,[s("为 vuepress 站点添加侧边导航栏"),e(a)]),s(" 。")]),F])}const X=l(w,[["render",U],["__file","about_blog.html.vue"]]);export{X as default};
