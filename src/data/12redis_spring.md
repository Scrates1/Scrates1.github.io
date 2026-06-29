---
date: 2023-02-21 21:53:34
tags: Redis
categories: 技术 
---

# Spring Boot 整合 Redis

## 引入相关依赖

```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<dependency>
   <groupId>org.apache.commons</groupId>
   <artifactId>commons-pool2</artifactId>
</dependency>
```

## Spring Boot 项目核心配置

> 以下是采用的集群配置的方式

```properties
server:
  port: 8080

spring:
  redis:
    database: 0
    timeout: 3000
    password: XXX
    # 集群节点
    cluster:
      nodes: 192.168.0.61:8001,192.168.0.62:8002,192.168.0.63:8003,192.168.0.61:8004,192.168.0.62:8005,192.168.0.63:8006
   lettuce:
      pool:
      	#连接池中的最大空闲连接
        max-idle: 50
        min-idle: 10
        #连接池最大连接数，若为负，则表示没有任何限制
        max-active: 100
        #连接池最大阻塞等待时间，若为负，则表示没有任何限制
        max-wait: 1000
```

## 自动配置

当开发者在项目中引入了 Spring Data Redis ，并且配置了 Redis 的基本信息，此时，自动化配置就会生效。

我们从 Spring Boot 中 Redis 的自动化配置类中就可以看出端倪：

```java
@Configuration
@ConditionalOnClass(RedisOperations.class)
@EnableConfigurationProperties(RedisProperties.class)
@Import({ LettuceConnectionConfiguration.class, JedisConnectionConfiguration.class })
public class RedisAutoConfiguration {
        @Bean
        @ConditionalOnMissingBean(name = "redisTemplate")
        public RedisTemplate<Object, Object> redisTemplate(
                        RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
                RedisTemplate<Object, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(redisConnectionFactory);
                return template;
        }
        @Bean
        @ConditionalOnMissingBean
        public StringRedisTemplate stringRedisTemplate(
                        RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
                StringRedisTemplate template = new StringRedisTemplate();
                template.setConnectionFactory(redisConnectionFactory);
                return template;
        }
}
```

这个自动化配置类很好理解：

1. 首先标记这个是一个配置类，同时该配置在 RedisOperations 存在的情况下才会生效(即项目中引入了 Spring Data Redis)
2. 然后导入在 application.properties 中配置的属性
3. 然后再导入连接池信息（如果存在的话）
4. 最后，提供了两个 Bean ，RedisTemplate 和 StringRedisTemplate ，其中 StringRedisTemplate 是 RedisTemplate 的子类，两个的方法基本一致，不同之处主要体现在操作的数据类型不同，RedisTemplate 中的两个泛型都是 Object ，意味者存储的 key 和 value 都可以是一个对象，而 StringRedisTemplate 的 两个泛型都是 String ，意味者 StringRedisTemplate 的 key 和 value 都只能是字符串。如果开发者没有提供相关的 Bean ，这两个配置就会生效，否则不会生效。

## 访问代码

可以直接注入 StringRedisTemplate 或者 RedisTemplate 来使用：

```java
@RestController
public class IndexController {

    private static final Logger logger = LoggerFactory.getLogger(IndexController.class);

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @RequestMapping("/test_cluster")
    public void testCluster() throws InterruptedException {
       stringRedisTemplate.opsForValue().set("qiuchi", "666");
       System.out.println(stringRedisTemplate.opsForValue().get("qiuchi"));
    }
}
```

## StringRedisTemplate 与 RedisTemplate 详解

Spring 封装了 RedisTemplate 对象来进行对 Redis 进行各种操作，它支持所有的 Redis 原生的 API。在 RedisTemplate 中提供了几个常用的接口方法的使用，分别是:

```java
private ValueOperations<K, V> valueOps;
private HashOperations<K, V> hashOps;
private ListOperations<K, V> listOps;
private SetOperations<K, V> setOps;
private ZSetOperations<K, V> zSetOps;
```

​          

RedisTemplate中定义了对5种数据结构操作

```java
redisTemplate.opsForValue();//操作字符串
redisTemplate.opsForHash();//操作hash
redisTemplate.opsForList();//操作list
redisTemplate.opsForSet();//操作set
redisTemplate.opsForZSet();//操作有序set
```

StringRedisTemplate 继承自 RedisTemplate，也一样拥有上面这些操作。

StringRedisTemplate 默认采用的是 String 的序列化策略，保存的 key 和 value 都是采用此策略序列化保存的。

RedisTemplate 默认采用的是 JDK 的序列化策略，保存的 key 和 value 都是采用此策略序列化保存的。

**Redis客户端命令对应的RedisTemplate中的方法列表：**

| **String类型结构**                                         |                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| Redis                                                      | RedisTemplate rt                                            |
| set key value                                              | rt.opsForValue().set("key","value")                         |
| get key                                                    | rt.opsForValue().get("key")                                 |
| del key                                                    | rt.delete("key")                                            |
| strlen key                                                 | rt.opsForValue().size("key")                                |
| getset key value                                           | rt.opsForValue().getAndSet("key","value")                   |
| getrange key start end                                     | rt.opsForValue().get("key",start,end)                       |
| append key value                                           | rt.opsForValue().append("key","value")                      |
|                                                            |                                                             |
| **Hash结构**                                               |                                                             |
| hmset key field1 value1 field2 value2...                   | rt.opsForHash().putAll("key",map) //map是一个集合对象       |
| hset key field value                                       | rt.opsForHash().put("key","field","value")                  |
| hexists key field                                          | rt.opsForHash().hasKey("key","field")                       |
| hgetall key                                                | rt.opsForHash().entries("key") //返回Map对象                |
| hvals key                                                  | rt.opsForHash().values("key") //返回List对象                |
| hkeys key                                                  | rt.opsForHash().keys("key") //返回List对象                  |
| hmget key field1 field2...                                 | rt.opsForHash().multiGet("key",keyList)                     |
| hsetnx key field value                                     | rt.opsForHash().putIfAbsent("key","field","value"           |
| hdel key field1 field2                                     | rt.opsForHash().delete("key","field1","field2")             |
| hget key field                                             | rt.opsForHash().get("key","field")                          |
|                                                            |                                                             |
| **List结构**                                               |                                                             |
| lpush list node1 node2 node3...                            | rt.opsForList().leftPush("list","node")                     |
| rt.opsForList().leftPushAll("list",list) //list是集合对象  |                                                             |
| rpush list node1 node2 node3...                            | rt.opsForList().rightPush("list","node")                    |
| rt.opsForList().rightPushAll("list",list) //list是集合对象 |                                                             |
| lindex key index                                           | rt.opsForList().index("list", index)                        |
| llen key                                                   | rt.opsForList().size("key")                                 |
| lpop key                                                   | rt.opsForList().leftPop("key")                              |
| rpop key                                                   | rt.opsForList().rightPop("key")                             |
| lpushx list node                                           | rt.opsForList().leftPushIfPresent("list","node")            |
| rpushx list node                                           | rt.opsForList().rightPushIfPresent("list","node")           |
| lrange list start end                                      | rt.opsForList().range("list",start,end)                     |
| lrem list count value                                      | rt.opsForList().remove("list",count,"value")                |
| lset key index value                                       | rt.opsForList().set("list",index,"value")                   |
|                                                            |                                                             |
| **Set结构**                                                |                                                             |
| sadd key member1 member2...                                | rt.boundSetOps("key").add("member1","member2",...)          |
| rt.opsForSet().add("key", set) //set是一个集合对象         |                                                             |
| scard key                                                  | rt.opsForSet().size("key")                                  |
| sidff key1 key2                                            | rt.opsForSet().difference("key1","key2") //返回一个集合对象 |
| sinter key1 key2                                           | rt.opsForSet().intersect("key1","key2")//同上               |
| sunion key1 key2                                           | rt.opsForSet().union("key1","key2")//同上                   |
| sdiffstore des key1 key2                                   | rt.opsForSet().differenceAndStore("key1","key2","des")      |
| sinter des key1 key2                                       | rt.opsForSet().intersectAndStore("key1","key2","des")       |
| sunionstore des key1 key2                                  | rt.opsForSet().unionAndStore("key1","key2","des")           |
| sismember key member                                       | rt.opsForSet().isMember("key","member")                     |
| smembers key                                               | rt.opsForSet().members("key")                               |
| spop key                                                   | rt.opsForSet().pop("key")                                   |
| srandmember key count                                      | rt.opsForSet().randomMember("key",count)                    |
| srem key member1 member2...                                | rt.opsForSet().remove("key","member1","member2",...)        |

