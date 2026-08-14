package com.example.MultiUserSecurityDemo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.jedis.JedisClientConfiguration;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import redis.clients.jedis.JedisPoolConfig;

import java.time.Duration;

@Configuration
public class RedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Value("${spring.redis.timeout:2000}")
    private long redisTimeout;

    @Value("${spring.redis.database:0}")
    private int database;

    @Value("${spring.redis.jedis.pool.max-active:8}")
    private int maxActive;

    @Value("${spring.redis.jedis.pool.max-idle:8}")
    private int maxIdle;

    @Value("${spring.redis.jedis.pool.min-idle:0}")
    private int minIdle;

    @Value("${spring.redis.jedis.pool.max-wait:-1}")
    private long maxWait;

    @Value("${spring.redis.client-name:MultiUserSecurityDemo}")
    private String clientName;

    @Bean
    public JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig config = new JedisPoolConfig();

        // Connection pool sizing
        config.setMaxTotal(maxActive);
        config.setMaxIdle(maxIdle);
        config.setMinIdle(minIdle);
        config.setMaxWaitMillis(maxWait);

        // Connection validation
        config.setTestOnBorrow(true);
        config.setTestOnReturn(true);
        config.setTestWhileIdle(true);

        // Idle connection handling
        config.setMinEvictableIdleTimeMillis(Duration.ofSeconds(60).toMillis());
        config.setTimeBetweenEvictionRunsMillis(Duration.ofSeconds(30).toMillis());
        config.setNumTestsPerEvictionRun(3);

        // Block when pool exhausted (true = wait, false = throw exception)
        config.setBlockWhenExhausted(true);

        logger.info("Jedis Pool Config: maxActive={}, maxIdle={}, minIdle={}, maxWait={}ms",
                maxActive, maxIdle, minIdle, maxWait);

        return config;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory(JedisPoolConfig jedisPoolConfig) {
        // Configure Redis server details
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        redisConfig.setDatabase(database);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }

        // Create Jedis connection factory with pooling
        JedisClientConfiguration.JedisClientConfigurationBuilder jedisClientConfig =
                JedisClientConfiguration.builder()
                        .usePooling()
                        .poolConfig(jedisPoolConfig)
                        .and()
                        .clientName(clientName)
                        .connectTimeout(Duration.ofMillis(redisTimeout));

        JedisConnectionFactory factory = new JedisConnectionFactory(redisConfig, jedisClientConfig.build());

        logger.info("Redis Connection Factory initialized: host={}, port={}, database={}",
                redisHost, redisPort, database);

        return factory;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Key serializer: plain strings
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Value serializer: JSON (handles objects, lists, maps)
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        // Enable transaction support
        template.setEnableTransactionSupport(true);

        // Initialize
        template.afterPropertiesSet();

        logger.debug("RedisTemplate configured with JSON serialization");

        return template;
    }

    @Bean
    public <T> RedisTemplate<String, T> typedRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, T> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.setEnableTransactionSupport(true);
        template.afterPropertiesSet();

        return template;
    }

    @Bean
    public RedisConnectionTest redisConnectionTest(RedisConnectionFactory connectionFactory) {
        return new RedisConnectionTest(connectionFactory);
    }

    public static class RedisConnectionTest {
        private static final Logger log = LoggerFactory.getLogger(RedisConnectionTest.class);

        public RedisConnectionTest(RedisConnectionFactory connectionFactory) {
            try {
                connectionFactory.getConnection().ping();
                log.info("✓ Redis connection successful");
            } catch (Exception e) {
                log.warn("⚠ Redis connection failed: {}. Cache will be unavailable, falling back to database.",
                        e.getMessage());
            }
        }
    }
}
