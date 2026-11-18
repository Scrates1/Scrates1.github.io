import{_ as e}from"./plugin-vue_export-helper-c27b6911.js";import{r as t,o as p,c as i,a as n,b as s,e as o,f as l}from"./app-99582225.js";const c="/assets/pojo-0bc1ca3d.jpg",r={},u=n("h1",{id:"名词解释——pojo",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#名词解释——pojo","aria-hidden":"true"},"#"),s(" 名词解释——POJO")],-1),d={href:"https://www.geeksforgeeks.org/pojo-vs-java-beans/",target:"_blank",rel:"noopener noreferrer"},v=l(`<h2 id="什么是pojo" tabindex="-1"><a class="header-anchor" href="#什么是pojo" aria-hidden="true">#</a> 什么是POJO</h2><p>POJO 全称是 Plain Old Java Object。<br><strong>它是一个普通的 Java 对象，不受任何特殊限制的约束</strong>，只受 Java 语言规范的约束，不需要任何类路径（ not requiring any classpath，秋迟感觉意思应该是不需要依赖其它类）。POJO 用于提高程序的可读性和可重用性。POJO 获得了最多的接受，因为它们易于编写和理解。它们是在 EJB 3.0 中由 Sun microsystems 引入的。</p><p>POJO不应：</p><ul><li><p>继承预先指定的类</p><p>例如：public class GFG extends javax.servlet.http.HttpServlet { … } 不是 POJO 类。</p></li><li><p>实现预先指定的接口</p><p>例如：public class Bar implements javax.ejb.EntityBean { … } 不是 POJO 类。</p></li></ul><blockquote><p>这一点跟后面的<code>实现 Serializable 接口</code>相悖，姑且认为这一点不包括<code>Serializable接口</code>吧。@qiuchi</p></blockquote><ul><li><p>包含预先指定的注解</p><p>例如：@javax.persistence.Entity public class Baz { … }不是 POJO 类。</p></li></ul><p>POJO定义了一个实体。如果您想要一个Employee类，那么您可以创建一个POJO，如下所示：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Employee POJO class to represent entity Employee</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">Employee</span>
<span class="token punctuation">{</span>
	<span class="token comment">// default field</span>
	<span class="token class-name">String</span> name<span class="token punctuation">;</span>

	<span class="token comment">// public field</span>
	<span class="token keyword">public</span> <span class="token class-name">String</span> id<span class="token punctuation">;</span>

	<span class="token comment">// private salary</span>
	<span class="token keyword">private</span> <span class="token keyword">double</span> salary<span class="token punctuation">;</span>

	<span class="token comment">//arg-constructor to initialize fields</span>
	<span class="token keyword">public</span> <span class="token class-name">Employee</span><span class="token punctuation">(</span><span class="token class-name">String</span> name<span class="token punctuation">,</span> <span class="token class-name">String</span> id<span class="token punctuation">,</span>
							<span class="token keyword">double</span> salary<span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">this</span><span class="token punctuation">.</span>name <span class="token operator">=</span> name<span class="token punctuation">;</span>
		<span class="token keyword">this</span><span class="token punctuation">.</span>id <span class="token operator">=</span> id<span class="token punctuation">;</span>
		<span class="token keyword">this</span><span class="token punctuation">.</span>salary <span class="token operator">=</span> salary<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// getter method for name</span>
	<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getName</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">return</span> name<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// getter method for id</span>
	<span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">getId</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">return</span> id<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>

	<span class="token comment">// getter method for salary</span>
	<span class="token keyword">public</span> <span class="token class-name">Double</span> <span class="token function">getSalary</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">return</span> salary<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的示例是 POJO 类的一个定义良好的示例。如您所见，</p><ul><li>对字段的访问修饰符（access-modifiers）没有限制。它们可以是私有的、默认的、受保护的或公有的（private, default, protected, or public）。</li><li>另外，类中可以不包含任何构造函数。</li></ul><p>POJO 是一个封装了业务逻辑的对象（an object which encapsulates Business Logic）。下图显示了 POJO 类的工作示例。控制器与业务逻辑交互，业务逻辑又与 POJO 交互以访问数据库。在此示例中，数据库实体由 POJO 表示。这个 POJO 具有与数据库实体相同的成员。<br><img src="`+c+`" alt="pojo" loading="lazy"></p><h2 id="什么是java-beans" tabindex="-1"><a class="header-anchor" href="#什么是java-beans" aria-hidden="true">#</a> 什么是Java Beans</h2><p>Bean 是特殊类型的POJO,POJO 成为一种Bean是有一些条件的：</p><ol><li><p>所有的 JavaBean 都是 POJO，但并非所有的 POJO 都是 JavaBean。</p></li><li><p><strong>Serializable，Bean 应该实现 Serializable 接口</strong>。(一些没有实现 Serializer 接口的 POJO 仍被称为 POJO。)</p></li></ol><blockquote><p>这里原文是：<br> Serializable i.e. they should implement Serializable interface. Still, some POJOs who don’t implement a Serializable interface are called POJOs because Serializable is a marker interface and therefore not of many burdens.</p></blockquote><ol start="3"><li><p><strong>字段应该是私有的</strong>。这是为了提供对字段的完全控制。</p></li><li><p><strong>字段应该有 getter 或 setter</strong>，或者两者都有。</p></li><li><p>Bean 中应该有一个 <strong>无参（no-arg）构造函数</strong>。</p></li><li><p>字段只能由构造函数或 getter 设置器访问。</p></li></ol><p>Getter 和 Setter 根据字段名，有特殊的命名规则。例如，如果字段名是 someProperty，那么它的 getter 最好是:</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token string">&quot;returnType&quot;</span> <span class="token function">getSomeProperty</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
   <span class="token keyword">return</span> someProperty<span class="token punctuation">;</span>
<span class="token punctuation">}</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而setter 方法如下：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setSomePRoperty</span><span class="token punctuation">(</span>someProperty<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
   <span class="token keyword">this</span><span class="token punctuation">.</span>someProperty<span class="token operator">=</span>someProperty<span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Getter 和 Setter 方法通常可见性设为 public。Getter 和 Setter 提供了对字段的完全限制。例如考虑下面的属性：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token class-name">Integer</span> age<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果你把 age 的可见性设置为 public，（如 <code>public Integer age</code>）那么任何对象都可以直接访问。假设你想让 age 不能为0，在这种情况下，你就无法控制了。任何对象都可以将其设置为 0 。但是通过使用 setter 方法，你就可以控制。你可以在 setter 方法中设置一个条件。同样，对于 getter 方法，如果你希望你的年龄是 0，那么它应该返回 null，你可以通过使用 getter 方法来实现，如下所示：</p><div class="language-java line-numbers-mode" data-ext="java"><pre class="language-java"><code><span class="token comment">// Java program to illustrate JavaBeans</span>
<span class="token keyword">class</span> <span class="token class-name">Bean</span>
<span class="token punctuation">{</span>
	<span class="token comment">// private field property</span>
	<span class="token keyword">private</span> <span class="token class-name">Integer</span> property<span class="token punctuation">;</span>
	<span class="token class-name">Bean</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">// No-arg constructor</span>
	<span class="token punctuation">}</span>
	
	<span class="token comment">// setter method for property</span>
	<span class="token keyword">public</span> <span class="token keyword">void</span> <span class="token function">setProperty</span><span class="token punctuation">(</span><span class="token class-name">Integer</span> property<span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">if</span> <span class="token punctuation">(</span>property <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token comment">// if property is 0 return</span>
			<span class="token keyword">return</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">this</span><span class="token punctuation">.</span>property<span class="token operator">=</span>property<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	
	<span class="token comment">// getter method for property</span>
	<span class="token keyword">public</span> <span class="token class-name">Integer</span> <span class="token function">getProperty</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token keyword">if</span> <span class="token punctuation">(</span>property <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
		<span class="token punctuation">{</span>
			<span class="token comment">// if property is 0 return null</span>
			<span class="token keyword">return</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
		<span class="token punctuation">}</span>
		<span class="token keyword">return</span> property<span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
	
<span class="token comment">// Class to test above bean</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">GFG</span>
<span class="token punctuation">{</span>
	<span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token class-name">Bean</span> bean <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Bean</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
		bean<span class="token punctuation">.</span><span class="token function">setProperty</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;After setting to 0: &quot;</span> <span class="token operator">+</span>
								bean<span class="token punctuation">.</span><span class="token function">getProperty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
		bean<span class="token punctuation">.</span><span class="token function">setProperty</span><span class="token punctuation">(</span><span class="token number">5</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token class-name">System</span><span class="token punctuation">.</span>out<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span><span class="token string">&quot;After setting to valid&quot;</span> <span class="token operator">+</span>
					<span class="token string">&quot; value: &quot;</span> <span class="token operator">+</span> bean<span class="token punctuation">.</span><span class="token function">getProperty</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Output:-</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>
After setting to 0: null
After setting to valid value: 5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="pojo-vs-java-bean" tabindex="-1"><a class="header-anchor" href="#pojo-vs-java-bean" aria-hidden="true">#</a> POJO vs Java Bean</h2><table><thead><tr><th><p style="text-align:center;">POJO</p></th><th><p style="text-align:center;">Java Bean</p></th></tr></thead><tbody><tr><td>It doesn’t have special restrictions other than those forced by Java language.（只被Java语言限制）</td><td>It is a special POJO which have some restrictions.（特殊的POJO）</td></tr><tr><td>It doesn’t provide much control on members.（对成员变量的控制性不强）</td><td>It provides complete control on members.（完全控制成员变量（只能通过getter或者setter或者构造函数访问））</td></tr><tr><td>It can implement Serializable interface.（可以序列化，不必须）</td><td>It should implement serializable interface.（应该序列化）</td></tr><tr><td>Fields can be accessed by their names.</td><td>Fields are accessed only by getters and setters.</td></tr><tr><td>Fields can have any visibility.</td><td>Fields have only private visibility.</td></tr><tr><td>There may/may-not be a no-arg constructor.</td><td>It must have a no-arg constructor.（必须有无参构造函数）</td></tr><tr><td>It is used when you don’t want to give restriction on your members and give user complete access of your entity</td><td>It is used when you want to provide user your entity but only some part of your entity.</td></tr></tbody></table><h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结" aria-hidden="true">#</a> 总结</h2><p>POJO 类和 Bean 都用于定义 java 对象，以增加其可读性和可重用性。POJO 没有其他限制，而 Bean 是带有一些限制的特殊 POJO。</p>`,30);function k(m,b){const a=t("ExternalLinkIcon");return p(),i("div",null,[u,n("blockquote",null,[n("p",null,[s("本文译自< "),n("a",d,[s("https://www.geeksforgeeks.org/pojo-vs-java-beans/"),o(a)]),s(">，主要讲解 POJO 的特点与用处，并与 Java Bean 进行对比。@qiuchi")])]),v])}const h=e(r,[["render",k],["__file","071noun_explanation_pojo.html.vue"]]);export{h as default};
