package com.example.MultiUserSecurityDemo.config.constants;

import java.time.Duration;

public class CacheKeyConstants {

    public static final String PRODUCT_PREFIX = "product";

    // Product by ID: product:123
    public static String getProductByIdKey(Long id) {
        return String.format("%s:%d", PRODUCT_PREFIX, id);
    }

    // All products: product:all
    public static final String PRODUCT_ALL_KEY = PRODUCT_PREFIX + ":all";

    // Products by category: product:category:electronics
    public static String getProductByCategoryKey(String category) {
        return String.format("%s:category:%s", PRODUCT_PREFIX, category);
    }

    // Active products by category: product:active:category:electronics
    public static String getActiveProductByCategoryKey(String category) {
        return String.format("%s:active:category:%s", PRODUCT_PREFIX, category);
    }

    // Products by price range: product:price-range:10.0:100.0
    public static String getProductByPriceRangeKey(Double minPrice, Double maxPrice) {
        return String.format("%s:price-range:%s:%s", PRODUCT_PREFIX, minPrice, maxPrice);
    }

    // Search results: product:search:laptop
    public static String getProductSearchKey(String keyword) {
        return String.format("%s:search:%s", PRODUCT_PREFIX, keyword);
    }

    // Featured products: product:featured
    public static final String PRODUCT_FEATURED_KEY = PRODUCT_PREFIX + ":featured";

    // Low stock products: product:low-stock:10
    public static String getLowStockProductsKey(Integer threshold) {
        return String.format("%s:low-stock:%d", PRODUCT_PREFIX, threshold);
    }

    // Sorted products: product:sorted:asc, product:sorted:desc
    public static String getProductSortedKey(String order) {
        return String.format("%s:sorted:%s", PRODUCT_PREFIX, order);
    }

    // Compare products: product:compare:123:456:789
    public static String getProductCompareKey(java.util.List<Long> ids) {
        return PRODUCT_PREFIX + ":compare:" + String.join(":", ids.stream().map(String::valueOf).toArray(String[]::new));
    }

    // ==================== Category Cache Keys ====================
    public static final String CATEGORY_PREFIX = "category";

    // All categories: category:list
    public static final String CATEGORY_ALL_KEY = CATEGORY_PREFIX + ":list";

    // Category counts: category:counts
    public static final String CATEGORY_COUNTS_KEY = CATEGORY_PREFIX + ":counts";

    // ==================== Statistics Cache Keys ====================
    public static final String STATS_PREFIX = "stats";

    // Product statistics: stats:product
    public static final String PRODUCT_STATS_KEY = STATS_PREFIX + ":product";

    // Category price analysis: stats:category-price:electronics
    public static String getCategoryPriceAnalysisKey(String category) {
        return String.format("%s:category-price:%s", STATS_PREFIX, category);
    }

    // ==================== Order Cache Keys ====================
    public static final String ORDER_PREFIX = "order";

    // Order by ID: order:123
    public static String getOrderByIdKey(Long id) {
        return String.format("%s:%d", ORDER_PREFIX, id);
    }

    // All orders: order:all
    public static final String ORDER_ALL_KEY = ORDER_PREFIX + ":all";

    // Orders by status: order:status:pending
    public static String getOrderByStatusKey(String status) {
        return String.format("%s:status:%s", ORDER_PREFIX, status);
    }

    // Orders by user: order:user:user123
    public static String getOrderByUserKey(String userId) {
        return String.format("%s:user:%s", ORDER_PREFIX, userId);
    }

    // ==================== User Cache Keys ====================
    public static final String USER_PREFIX = "user";

    // User by ID: user:123
    public static String getUserByIdKey(Long id) {
        return String.format("%s:%d", USER_PREFIX, id);
    }

    // User by email: user:email:user@example.com
    public static String getUserByEmailKey(String email) {
        return String.format("%s:email:%s", USER_PREFIX, email.toLowerCase());
    }

    // All users (use with caution): user:all
    public static final String USER_ALL_KEY = USER_PREFIX + ":all";

    // ==================== Pattern Keys (for invalidation/scanning) ====================

    // Invalidate all product cache: product:*
    public static final String PRODUCT_PATTERN = PRODUCT_PREFIX + ":*";

    // Invalidate all category cache: category:*
    public static final String CATEGORY_PATTERN = CATEGORY_PREFIX + ":*";

    // Invalidate all statistics: stats:*
    public static final String STATS_PATTERN = STATS_PREFIX + ":*";

    // Invalidate all order cache: order:*
    public static final String ORDER_PATTERN = ORDER_PREFIX + ":*";

    // Invalidate all user cache: user:*
    public static final String USER_PATTERN = USER_PREFIX + ":*";

    // ==================== Cache TTL Configuration ====================
    // Organized by data volatility

    public static class CacheTTL {

        // Product-related TTLs
        public static final Duration PRODUCT_BY_ID = Duration.ofHours(24);        // Stable
        public static final Duration PRODUCT_ALL = Duration.ofMinutes(30);        // Lists update freq
        public static final Duration PRODUCT_BY_CATEGORY = Duration.ofMinutes(30); // Category updates
        public static final Duration PRODUCT_ACTIVE_CATEGORY = Duration.ofMinutes(30);
        public static final Duration PRODUCT_PRICE_RANGE = Duration.ofMinutes(30);
        public static final Duration PRODUCT_SEARCH = Duration.ofMinutes(15);     // Dynamic queries
        public static final Duration PRODUCT_FEATURED = Duration.ofHours(1);      // Curated list
        public static final Duration PRODUCT_LOW_STOCK = Duration.ofMinutes(15);  // Needs updates
        public static final Duration PRODUCT_SORTED = Duration.ofMinutes(30);
        public static final Duration PRODUCT_COMPARE = Duration.ofMinutes(15);

        // Category-related TTLs
        public static final Duration CATEGORY_LIST = Duration.ofHours(24);        // Rarely changes
        public static final Duration CATEGORY_COUNTS = Duration.ofMinutes(30);    // Inventory changes
        public static final Duration CATEGORY_PRICE_ANALYSIS = Duration.ofHours(1);

        // Statistics TTLs
        public static final Duration PRODUCT_STATISTICS = Duration.ofHours(1);    // Aggregate data

        // Order-related TTLs
        public static final Duration ORDER_BY_ID = Duration.ofHours(6);           // Orders change status
        public static final Duration ORDER_ALL = Duration.ofMinutes(15);          // Frequent updates
        public static final Duration ORDER_BY_STATUS = Duration.ofMinutes(15);
        public static final Duration ORDER_BY_USER = Duration.ofMinutes(30);

        // User-related TTLs
        public static final Duration USER_BY_ID = Duration.ofHours(2);            // User info changes
        public static final Duration USER_BY_EMAIL = Duration.ofHours(2);
        public static final Duration USER_ALL = Duration.ofMinutes(60);           // Rarely cached
    }

    // ==================== Cache Invalidation Strategy ====================
    public static class InvalidationPatterns {

        // Product creation invalidates
        public static final String[] PRODUCT_CREATE_INVALIDATE = {
                PRODUCT_ALL_KEY,
                CATEGORY_PATTERN,
                STATS_PATTERN
        };

        // Product update invalidates (more specific)
        public static String[] getProductUpdateInvalidate(Long productId, String category) {
            return new String[]{
                    getProductByIdKey(productId),
                    PRODUCT_ALL_KEY,
                    getProductByCategoryKey(category),
                    STATS_PATTERN,
                    PRODUCT_FEATURED_KEY
            };
        }

        // Product delete invalidates
        public static String[] getProductDeleteInvalidate(Long productId, String category) {
            return new String[]{
                    getProductByIdKey(productId),
                    PRODUCT_ALL_KEY,
                    getProductByCategoryKey(category),
                    CATEGORY_PATTERN,
                    STATS_PATTERN,
                    PRODUCT_FEATURED_KEY
            };
        }

        // Stock update invalidates
        public static String[] getStockUpdateInvalidate(Long productId) {
            return new String[]{
                    getProductByIdKey(productId),
                    PRODUCT_ALL_KEY,
                    STATS_PATTERN
            };
        }
    }

    // ==================== Helper Methods ====================
    public static String[] getAllPatterns() {
        return new String[]{
                PRODUCT_PATTERN,
                CATEGORY_PATTERN,
                STATS_PATTERN,
                ORDER_PATTERN,
                USER_PATTERN
        };
    }

    public static String generateKey(String prefix, String... parts) {
        StringBuilder key = new StringBuilder(prefix);
        for (String part : parts) {
            key.append(":").append(part);
        }
        return key.toString();
    }
}