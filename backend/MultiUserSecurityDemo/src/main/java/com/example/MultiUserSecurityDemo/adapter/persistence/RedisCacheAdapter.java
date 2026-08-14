package com.example.MultiUserSecurityDemo.adapter.persistence;

import com.example.MultiUserSecurityDemo.domain.port.CachePort;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCacheAdapter implements CachePort {


    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // ==================== SINGLE OBJECT OPERATIONS ====================

    @Override
    public Optional<Object> get(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                log.trace("Cache MISS for key: {}", key);
                return Optional.empty();
            }
            log.trace("Cache HIT for key: {}", key);
            return Optional.of(value);
        } catch (Exception e) {
            log.error("Error getting value from cache for key: {}", key, e);
            return Optional.empty(); // Graceful fallback
        }
    }

    @Override
    public <T> Optional<T> getSingle(String key, Class<T> type) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                log.trace("Cache MISS for single object: {}", key);
                return Optional.empty();
            }

            // If value is a String (JSON), deserialize it
            if (value instanceof String) {
                try {
                    String jsonString = (String) value;
                    T typedObject = objectMapper.readValue(jsonString, type);
                    log.trace("Cache HIT (deserialized) for single object: {}", key);
                    return Optional.of(typedObject);
                } catch (Exception e) {
                    log.error("Failed to deserialize cached value for key: {}", key, e);
                    return Optional.empty();
                }
            }

            // Direct cast if already deserialized
            log.trace("Cache HIT (direct) for single object: {}", key);
            return Optional.of((T) value);

        } catch (Exception e) {
            log.error("Error getting single object from cache for key: {}", key, e);
            return Optional.empty(); // Graceful fallback - never crash
        }
    }

    @Override
    public Optional<Object> getList(String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                log.trace("Cache MISS for list: {}", key);
                return Optional.empty();
            }
            log.trace("Cache HIT for list: {}", key);
            return Optional.of(value);
        } catch (Exception e) {
            log.error("Error getting list from cache for key: {}", key, e);
            return Optional.empty(); // Graceful fallback
        }
    }

    // ==================== SET OPERATIONS ====================
    @Override
    public boolean set(String key, Object value, Duration duration) {
        try {
            if (value == null) {
                log.warn("Attempting to cache null value for key: {}", key);
                return false;
            }

            redisTemplate.opsForValue().set(key, value, duration);
            log.trace("Successfully cached key: {} with TTL: {}", key, duration);
            return true;

        } catch (Exception e) {
            log.error("Error setting cache for key: {} | Value: {}", key, value.getClass().getSimpleName(), e);
            return false; // Graceful fallback - never crash
        }
    }

    @Override
    public boolean setWithDefaultTTL(String key, Object value) {
        return set(key, value, Duration.ofMinutes(30));
    }

    // ==================== DELETE OPERATIONS ====================
    @Override
    public boolean delete(String key) {
        try {
            Boolean deleted = redisTemplate.delete(key);
            if (Boolean.TRUE.equals(deleted)) {
                log.trace("Successfully deleted cache key: {}", key);
                return true;
            }
            log.trace("Cache key not found for deletion: {}", key);
            return false;
        } catch (Exception e) {
            log.error("Error deleting cache key: {}", key, e);
            return false; // Graceful fallback
        }
    }

    @Override
    public long deleteMultiple(List<String> keys) {
        try {
            if (keys == null || keys.isEmpty()) {
                return 0;
            }
            Long deletedCount = redisTemplate.delete(keys);
            log.trace("Deleted {} cache keys", deletedCount);
            return deletedCount != null ? deletedCount : 0;
        } catch (Exception e) {
            log.error("Error deleting multiple cache keys", e);
            return 0; // Graceful fallback
        }
    }

    @Override
    public long deleteByPattern(String pattern) {
        try {
            long deletedCount = 0;
            Set<String> keys = new HashSet<>();

            // Use SCAN for non-blocking pattern matching
            ScanOptions scanOptions = ScanOptions.scanOptions()
                    .match(pattern)
                    .count(100)
                    .build();

            var cursor = redisTemplate.scan(scanOptions);
            while (cursor.hasNext()) {
                keys.add(cursor.next());
            }

            if (!keys.isEmpty()) {
                deletedCount = deleteMultiple(new ArrayList<>(keys));
                log.trace("Deleted {} keys matching pattern: {}", deletedCount, pattern);
            }

            return deletedCount;

        } catch (Exception e) {
            log.error("Error deleting cache keys by pattern: {}", pattern, e);
            return 0; // Graceful fallback
        }
    }

    // ==================== CHECK OPERATIONS ====================
    @Override
    public boolean exists(String key) {
        try {
            Boolean exists = redisTemplate.hasKey(key);
            return Boolean.TRUE.equals(exists);
        } catch (Exception e) {
            log.error("Error checking cache key existence: {}", key, e);
            return false; // Assume doesn't exist on error
        }
    }

    @Override
    public List<String> getKeys(String pattern) {
        try {
            Set<String> keys = new HashSet<>();
            ScanOptions scanOptions = ScanOptions.scanOptions()
                    .match(pattern)
                    .count(100)
                    .build();

            var cursor = redisTemplate.scan(scanOptions);
            while (cursor.hasNext()) {
                keys.add(cursor.next());
            }

            log.trace("Found {} keys matching pattern: {}", keys.size(), pattern);
            return new ArrayList<>(keys);

        } catch (Exception e) {
            log.error("Error getting keys by pattern: {}", pattern, e);
            return new ArrayList<>(); // Return empty list on error
        }
    }

    @Override
    public long countKeys(String pattern) {
        try {
            return getKeys(pattern).size();
        } catch (Exception e) {
            log.error("Error counting keys by pattern: {}", pattern, e);
            return 0;
        }
    }

    // ==================== UTILITY OPERATIONS ====================
    @Override
    public long flushAll() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushAll();
            log.warn("⚠️ All cache entries have been flushed!");
            return 1;
        } catch (Exception e) {
            log.error("Error flushing all cache entries", e);
            return 0;
        }
    }

    @Override
    public Map<String, String> getStats() {
        try {
            Map<String, String> stats = new HashMap<>();

            // Get Redis info
            String info = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .info()
                    .toString();

            stats.put("redisInfo", info);
            stats.put("timestamp", System.currentTimeMillis() + "");

            return stats;
        } catch (Exception e) {
            log.error("Error getting cache statistics", e);
            return new HashMap<>();
        }
    }

    @Override
    public boolean expire(String key, Duration duration) {
        try {
            Boolean result = redisTemplate.expire(key, duration);
            if (Boolean.TRUE.equals(result)) {
                log.trace("Successfully set expiration for key: {} | TTL: {}", key, duration);
                return true;
            }
            log.trace("Key not found for expiration: {}", key);
            return false;
        } catch (Exception e) {
            log.error("Error setting expiration for key: {}", key, e);
            return false;
        }
    }

    @Override
    public long increment(String key, long delta) {
        try {
            Long result = redisTemplate.opsForValue().increment(key, delta);
            log.trace("Incremented key: {} by: {} | New value: {}", key, delta, result);
            return result != null ? result : 0;
        } catch (Exception e) {
            log.error("Error incrementing key: {}", key, e);
            return 0;
        }
    }

    @Override
    public long append(String key, String value) {
        try {
            Long result = Long.valueOf(redisTemplate.opsForValue().append(key, value));
            log.trace("Appended to key: {} | New length: {}", key, result);
            return result != null ? result : 0;
        } catch (Exception e) {
            log.error("Error appending to key: {}", key, e);
            return 0;
        }
    }

}
