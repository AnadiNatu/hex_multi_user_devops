package com.example.MultiUserSecurityDemo.domain.port;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CachePort {
    Optional<Object> get(String key);
    <T> Optional<T> getSingle(String key, Class<T> type);
    Optional<Object> getList(String key);
    boolean set(String key, Object value, Duration duration);
    boolean setWithDefaultTTL(String key, Object value);
    boolean delete(String key);
    long deleteMultiple(List<String> keys);
    long deleteByPattern(String pattern);
    boolean exists(String key);
    List<String> getKeys(String pattern);
    long countKeys(String pattern);
    long flushAll();
    Map<String, String> getStats();
    boolean expire(String key, Duration duration);
    long increment(String key, long delta);
    long append(String key, String value);
}
