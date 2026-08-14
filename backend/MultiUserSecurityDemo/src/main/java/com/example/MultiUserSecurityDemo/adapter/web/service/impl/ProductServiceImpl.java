package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.persistence.mapper.ProductMapper;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.ProductService;
import com.example.MultiUserSecurityDemo.config.constants.CacheKeyConstants;
import com.example.MultiUserSecurityDemo.domain.model.Product;
import com.example.MultiUserSecurityDemo.domain.port.CachePort;
import com.example.MultiUserSecurityDemo.domain.port.ProductPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProductServiceImpl implements ProductService {


    private final ProductPort productPort;
    private final ProductMapper mapper;
    private final CachePort cachePort;
    private final CloudinaryService cloudinaryService;


//    @Caching(evict = {
//            @CacheEvict(value = "products" , allEntries = true),
//            @CacheEvict(value = "productsByCategory" , allEntries = true),
//            @CacheEvict(value = "productStatistics" , allEntries = true),
//            @CacheEvict(value = "categories" , allEntries = true)
//    })
    @Override
    public ProductResponse createProduct(ProductRequest request, MultipartFile image, String createdBy) {
        StopWatch sw = new StopWatch("createProduct");
        sw.start();
        log.info("[createProduct] START | createdBy={} | name={}" , createdBy , request.getName());

        try {
            Product product = new Product();

            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setStockQuantity(request.getStockQuantity());
            product.setCategory(request.getCategory());
//            product.setImageUrl(request.getImageUrl());
            product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
            product.setCreatedAt(LocalDateTime.now());
            product.setCreatedBy(createdBy);
            product.setOwnerType(deriveOwnerType(createdBy));

            Product savedProduct = productPort.save(product);

            if (image != null && !image.isEmpty()){
                String imageUrl = cloudinaryService.uploadProductImage(
                        image,
                        String.valueOf(savedProduct.getId()),
                        "ADMIN"
                );
                savedProduct.setImageUrl(imageUrl);
                savedProduct = productPort.save(savedProduct);
            }
            sw.stop();

            // Invalidate affected cache entries
            invalidateProductCreateCache();

            log.info("[createProduct] SUCCESS | id={} | duration={}ms", savedProduct.getId(), sw.getTotalTimeMillis());
            return mapper.mapToResponse(savedProduct);
        }catch (Exception ex){
            sw.stop();
            log.error("[createProduct] ERROR | createdBy={} | duration={}ms | error={}" , createdBy , sw.getTotalTimeMillis() , ex.getMessage());
            throw ex;
        }
    }


    @Override
    @Caching(
            evict = {
                    @CacheEvict(value = "products", allEntries = true),
                    @CacheEvict(value = "productsByCategory", allEntries = true),
                    @CacheEvict(value = "productStatistics", allEntries = true),
                    @CacheEvict(value = "categories", allEntries = true)
            }
    )
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile image ,String updatedBy) {

        StopWatch sw = new StopWatch("updateProduct");
        sw.start();
        log.info("[updateProduct] START | id={} | updatedBy={}", id, updatedBy);

        try {
            Product product = productPort.findById(id).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setStockQuantity(request.getStockQuantity());
            product.setCategory(request.getCategory());
//            product.setImageUrl(request.getImageUrl());
            product.setIsActive(request.getIsActive());
            product.setUpdatedAt(LocalDateTime.now());
            product.setUpdatedBy(updatedBy);

            String oldCategory = product.getCategory();

            if (image != null && !image.isEmpty()) {
                // Delete old image first
                if (product.getImageUrl() != null && !product.getImageUrl().isBlank()) {
                    String publicId = cloudinaryService.extractPublicId(product.getImageUrl());
                    if (publicId != null) {
                        cloudinaryService.deleteImage(publicId);
                    }
                }
                String newUrl = cloudinaryService.uploadProductImage(
                        image, String.valueOf(product.getId()), "ADMIN");
                product.setImageUrl(newUrl);
            }
                Product updatedProduct = productPort.save(product);

            // 3️ - INVALIDATE cache
            invalidateProductUpdateCache(id, oldCategory);

                sw.stop();
                log.info("[updateProduct] SUCCESS | id={} | duration={}", id, sw.getTotalTimeMillis());
                return mapper.mapToResponse(updatedProduct);
        } catch (Exception ex) {
            if (sw.isRunning()) sw.stop();
            log.error("[updateProduct] ERROR | id={} | duration={}ms | error={}", id, sw.getTotalTimeMillis() , ex.getMessage());
            throw ex;
        }
    }

    @Override
//    @Cacheable(value = "products" , key="#id")
    public ProductResponse getProductById(Long id) {
        log.debug("Getting product with ID: {}", id);

        String cacheKey = CacheKeyConstants.getProductByIdKey(id);
        try{
            // 1️ - Try Cache First (fastest path)
            Optional<ProductResponse> cachedProduct = cachePort.getSingle(cacheKey , ProductResponse.class);
            if (cachedProduct.isPresent()) {
                log.trace("✓ Cache HIT for product ID: {}", id);
                return cachedProduct.get();
            }

            // 2 - CACHE MISS: Query database
            log.trace("✗ Cache MISS for product ID: {}, querying database", id);
            Optional<Product> product = productPort.findById(id);

            if (product.isEmpty()) {
                log.warn("Product not found with ID: {}", id);
                throw new RuntimeException("Product not found with ID: " + id);
            }

            ProductResponse response = mapper.mapToResponse(product.get());

            // 3 - CACHE THE RESULT for future requests
            boolean cached = cachePort.set(cacheKey, response, CacheKeyConstants.CacheTTL.PRODUCT_BY_ID);

            if (!cached) {
                log.warn("Failed to cache product ID: {}, but continuing with DB result", id);
            } else {
                log.trace("✓ Cached product ID: {} with TTL: 24 hours", id);
            }

            return response;

        } catch (Exception e) {
            log.error("Error getting product by ID: {}", id, e);
            throw new RuntimeException("Failed to get product: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "products" , key = "'all'")
    public List<ProductResponse> getAllProducts() {
        log.debug("Getting all products");

        try {
            // 1️ - TRY CACHE
            Optional<Object> cachedProducts =
                    cachePort.getList(CacheKeyConstants.PRODUCT_ALL_KEY);

            if (cachedProducts.isPresent()) {
                log.trace("✓ Cache HIT for all products");
                return (List<ProductResponse>)  cachedProducts.get();
            }

            // 2️ - Cache Miss: Query database
            log.trace("✗ Cache MISS for all products, querying database");
            List<Product> products = productPort.findAll();
            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            // 3️ - Cache The Result
            cachePort.set(CacheKeyConstants.PRODUCT_ALL_KEY, responses, CacheKeyConstants.CacheTTL.PRODUCT_ALL);

            log.trace("✓ Cached all products ({} items) with TTL: 30 minutes", responses.size());
            return responses;

        } catch (Exception e) {
            log.error("Error getting all products", e);
            throw new RuntimeException("Failed to get products: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "productsByCategory" , key = "#category")
    public List<ProductResponse> getProductsByCategory(String category) {
//        StopWatch sw = new StopWatch("getProductsByCategory");
//        sw.start();
//        log.debug("[getProductsByCategory] START | category={}", category);
//
//        List<ProductResponse> result = productPort.findByCategory(category)
//                .stream()
//                .map(mapper::mapToResponse)
//                .collect(Collectors.toList());
//
//        sw.stop();
//        log.info("[getProductByCategory] SUCCESS | category={}" , category);
//        return result;

        log.debug("Getting products by category: {}", category);

        String cacheKey = CacheKeyConstants.getProductByCategoryKey(category);

        try {
            // 1️ - Try cache
            Optional<Object> cached = cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for category: {}", category);
                return (List<ProductResponse>) cached.get();
            }

            // 2️ - Cache Miss: Query database
            log.trace("✗ Cache MISS for category: {}", category);
            List<Product> products = productPort.findByCategory(category);
            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            // 3️ - Cache the result
            cachePort.set(cacheKey, responses,CacheKeyConstants.CacheTTL.PRODUCT_BY_CATEGORY);

            log.trace("Cached products for category: {} ({} items)", category, responses.size());
            return responses;

        } catch (Exception e) {
            log.error("Error getting products by category: {}", category, e);
            throw new RuntimeException("Failed to get products by category: " + e.getMessage());
        }
    }


    @Override
//    @Caching(evict = {
//            @CacheEvict(value = "products" , allEntries = true),
//            @CacheEvict(value = "productsByCategory" , allEntries = true),
//            @CacheEvict(value = "productStatistics" , allEntries = true),
//            @CacheEvict(value = "categories" , allEntries = true)
//    })
    public void deleteProduct(Long id) {
        StopWatch sw = new StopWatch("deleteProduct");
        sw.start();
        log.info("[deleteProduct] START | id={}" , id);

        try {
            // 1 - Get product before deletion (needed for category invalidation)
            Product product = productPort.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + id));

            String category = product.getCategory();

            // 2️ - Delete from database
            productPort.deleteById(id);

            // 3️ - invalidate cache
            invalidateProductDeleteCache(id, category);

            log.info("✓ Product ID: {} deleted", id);

        } catch (Exception e) {
            log.error("Error deleting product", e);
            throw new RuntimeException("Failed to delete product: " + e.getMessage());
        }
//        if (!productPort.existsById(id)) {
//            sw.stop();
//            log.warn("[deleteProduct] NOT_FOUND | id={} | duration={}ms", id, sw.getTotalTimeMillis());
//            throw new RuntimeException("Product not found with id: " + id);
//        }
//        productPort.deleteById(id);
//        sw.stop();
//        log.info("[deleteProduct] SUCCESS | id={} | duration={}ms", id, sw.getTotalTimeMillis());
    }

    @Override
//    @Cacheable(value = "productStatistics" , key = "'stats'")
    public Map<String, Object> getProductStatistics() {
//        StopWatch sw = new StopWatch("getProductStatics");
//        sw.start();
        log.debug("[getProductStatistics] START");
//        List<Product> allProducts = productPort.findAll();
//        List<Product> activeProducts = productPort.findByIsActive(true);
//
//        long totalProducts = allProducts.size();
//        long activeCount = activeProducts.size();
//        long inactiveCount = totalProducts - activeCount;
//
//        double totalValue = allProducts.stream()
//                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
//                .reduce(BigDecimal.ZERO , BigDecimal::add)
//                .doubleValue();
//
//        Map<String , Object> stats = new HashMap<>();
//        stats.put("totalProducts" , totalProducts);
//        stats.put("activeProducts" , activeCount);
//        stats.put("inactive" , inactiveCount);
//        stats.put("totalInventoryValue" , totalValue);
//        stats.put("totalStock" , allProducts.stream().mapToInt(Product::getStockQuantity).sum());
//
//        sw.stop();
//        log.info("[getProductStatistics] SUCCESS | totalProducts={} | duration={}ms" , totalProducts , sw.getTotalTimeMillis());
//        return stats;
        try {
            Optional<Object> cached = cachePort.getList(CacheKeyConstants.PRODUCT_STATS_KEY);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for product statistics");
                return (Map<String, Object>) cached.get();
            }

            log.trace("✗ Cache MISS for product statistics");

            List<Product> allProducts = productPort.findAll();

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", allProducts.size());
            stats.put("activeProducts", allProducts.stream()
                    .filter(p -> p.getIsActive() != null && p.getIsActive()).count());
            stats.put("totalValue", allProducts.stream()
                    .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            stats.put("averagePrice", allProducts.stream()
                    .map(Product::getPrice)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0.0));
            stats.put("lowStockCount", allProducts.stream()
                    .filter(p -> p.getStockQuantity() < 10).count());

            cachePort.set(
                    CacheKeyConstants.PRODUCT_STATS_KEY,
                    stats,
                    CacheKeyConstants.CacheTTL.PRODUCT_STATISTICS
            );

            return stats;

        } catch (Exception e) {
            log.error("Error getting product statistics", e);
            throw new RuntimeException("Failed to get statistics: " + e.getMessage());
        }

    }

    @Override
//    @Caching(
//            evict = {
//                    @CacheEvict(value = "products", allEntries = true),
//                    @CacheEvict(value = "productsByCategory", allEntries = true),
//                    @CacheEvict(value = "productStatistics", allEntries = true),
//                    @CacheEvict(value = "categories", allEntries = true)
//            }
//    )
    public ProductResponse updateProductStock(Long id, Integer quantity, String updatedBy) {
        StopWatch sw = new StopWatch("updateProductStock");
        sw.start();
        log.info("[updateProductStock] START | id={} | quantity={} | updatedBy={}" , id , quantity , updatedBy);

        try{
        Product product = productPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setStockQuantity(quantity);
        product.setUpdatedAt(LocalDateTime.now());
        product.setUpdatedBy(updatedBy);

        Product updatedProduct = productPort.save(product);

        // Invalidate cache
        invalidateStockUpdateCache(id);

        sw.stop();
        log.info("[updateProductStock] SUCCESS | id={} | newStock={} | duration = {}ms" , id , quantity , sw.getTotalTimeMillis());
        return mapper.mapToResponse(updatedProduct);
        }catch (Exception ex){
            sw.stop();
            log.error("[updateProductStock] ERROR | id={} | duration={}ms | error={}", id, sw.getTotalTimeMillis(), ex.getMessage());
            throw ex;
        }
    }

    @Override
    public List<ProductResponse> findLowStockProducts(Integer threshold) {
        log.debug("Finding low stock products with threshold: {}", threshold);

        String cacheKey = CacheKeyConstants.getLowStockProductsKey(threshold);

        try {
            Optional<Object> cached = cachePort.get(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for low stock products");
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for low stock products");

            List<Product> lowStock = productPort.findAll().stream()
                    .filter(p -> p.getStockQuantity() < threshold)
                    .collect(Collectors.toList());

            List<ProductResponse> responses = lowStock.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_LOW_STOCK);
            return responses;

        } catch (Exception e) {
            log.error("Error finding low stock products", e);
            throw new RuntimeException("Failed to get low stock products: " + e.getMessage());
        }
    }

    @Override
//    @CacheEvict(value = "productStatistics" , allEntries = true)
    public List<ProductResponse> bulkUpdateStock(Map<Long, Integer> stockUpdates, String updatedBy) {
        StopWatch sw = new StopWatch("bulkUpdateStock");
        sw.start();
        log.info("[bulkUpdateStock] START | count={} | updatedBy={}", stockUpdates.size(), updatedBy);

        try {
            List<ProductResponse> updatedProducts = new ArrayList<>();

            // Update all the product
            for (Map.Entry<Long, Integer> entry : stockUpdates.entrySet()) {
                Product product = productPort.findById(entry.getKey())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + entry.getKey()));

                product.setStockQuantity(entry.getValue());
                product.setUpdatedBy(updatedBy);
                Product updated = productPort.save(product);

                updatedProducts.add(mapper.mapToResponse(updated));
            }

            // 2️⃣ INVALIDATE cache for all products
            for (Long productId : stockUpdates.keySet()) {
                invalidateStockUpdateCache(productId);
            }

            sw.stop();
            log.info("[bulkUpdateStock] SUCCESS | updated={} | duration={}ms", updatedProducts.size(), sw.getTotalTimeMillis());
            return updatedProducts;
        } catch (Exception e) {
            log.error("Error in bulk stock update", e);
            throw new RuntimeException("Failed to update stock: " + e.getMessage());
        }
    }

    @Override
    @Cacheable(value = "productsByCategory" , key = "'analysis_' + #category")
    public Map<String, Object> getCategoryPriceAnalysis(String category) {
        log.debug("[getCategoryPriceAnalysis] START | category={}", category);

        String cacheKey = CacheKeyConstants.getCategoryPriceAnalysisKey(category);

        try {
            Optional<Object> cached = cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for category price analysis: {}", category);
                return (Map<String, Object>) cached.get();
            }

            log.trace("✗ Cache MISS for category price analysis: {}", category);

            List<Product> categoryProducts = productPort.findByCategory(category);

            Map<String, Object> analysis = new HashMap<>();
            analysis.put("category", category);
            analysis.put("productCount", categoryProducts.size());
            analysis.put("minPrice", categoryProducts.stream()
                    .map(Product::getPrice)
                    .min(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO));
            analysis.put("maxPrice", categoryProducts.stream()
                    .map(Product::getPrice)
                    .max(Comparator.naturalOrder())
                    .orElse(BigDecimal.ZERO));
            analysis.put("avgPrice", categoryProducts.stream()
                    .map(Product::getPrice)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0.0));

            cachePort.set(cacheKey, analysis, CacheKeyConstants.CacheTTL.CATEGORY_PRICE_ANALYSIS);
            return analysis;

        } catch (Exception e) {
            log.error("Error getting category price analysis", e);
            throw new RuntimeException("Failed to get analysis: " + e.getMessage());
        }
    }

//    @Caching(
//            evict = {
//                    @CacheEvict(value = "products", allEntries = true),
//                    @CacheEvict(value = "productsByCategory", allEntries = true),
//                    @CacheEvict(value = "productStatistics", allEntries = true),
//                    @CacheEvict(value = "categories", allEntries = true)
//            }
//    )
    public ProductResponse toggleProductActive(Long id, String updatedBy) {
        StopWatch sw = new StopWatch("toggleProductActive");
        sw.start();
        log.info("[toggleProductActive] START | id={} | updatedBy={}" , id , updatedBy);

        try {
            Product product = productPort.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

//            boolean newState = !product.getIsActive();

            product.setIsActive(!Boolean.TRUE.equals(product.getIsActive()));
            product.setUpdatedAt(LocalDateTime.now());
            product.setUpdatedBy(updatedBy);

            // 2️ - Invalidate cache
            invalidateProductUpdateCache(id, product.getCategory());

            Product updatedProduct = productPort.save(product);
            sw.stop();
            log.info("[toggleProductActive] SUCCESS | id={} | isActive={} | duration={}ms" , id , !Boolean.TRUE.equals(product.getIsActive()) , sw.getTotalTimeMillis());
            return mapper.mapToResponse(updatedProduct);
        }catch (Exception ex){
            sw.stop();
            log.error("[toggleProductActive] ERROR | id = {} | duration = {} | error ={} " , id , sw.getTotalTimeMillis() , ex.getMessage());
            throw ex;
        }
    }

    @Override
    public List<ProductResponse> searchProductByName(String keyword) {
        log.debug("[searchProductByName] START | keyword={}" , keyword);
        String cacheKey = CacheKeyConstants.getProductSearchKey(keyword);

        try {
            Optional<Object> cached = cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for search: {}", keyword);
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for search: {}", keyword);

            // Search using database
            List<Product> products = productPort.findAll().stream()
                    .filter(p -> p.getName().toLowerCase().contains(keyword.toLowerCase()))
                    .collect(Collectors.toList());

            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            // Cache with shorter TTL for dynamic queries
            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_SEARCH);
            return responses;

        } catch (Exception e) {
            log.error("Error searching products by name: {}", keyword, e);
            throw new RuntimeException("Failed to search products: " + e.getMessage());
        }
    }

    @Override
//    @Cacheable(value = "categories" , key = "'all'")
    public List<String> getAllCategories() {
        log.debug("[getAllCategories] START");
//        return productPort.findAll()
//                .stream()
//                .map(Product::getCategory)
//                .filter(Objects::nonNull)
//                .distinct()
//                .sorted()
//                .collect(Collectors.toList());

        try {
            Optional<Object> cached = cachePort.get(CacheKeyConstants.CATEGORY_ALL_KEY);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for all categories");
                return (List<String>) cached.get();
            }

            log.trace("✗ Cache MISS for all categories");

            List<String> categories = productPort.findAll().stream()
                    .map(Product::getCategory)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            cachePort.set(CacheKeyConstants.CATEGORY_ALL_KEY, categories, CacheKeyConstants.CacheTTL.CATEGORY_LIST);

            return categories;
        } catch (Exception e) {
            log.error("Error getting all categories", e);
            throw new RuntimeException("Failed to get categories: " + e.getMessage());
        }
    }

    @Override
//    @Cacheable(value = "categories" , key = "'counts'")
    public Map<String, Long> getCategoryCounts() {
        log.debug("[getCategoryCounts] START");
//        return productPort
//                .findAll()
//                .stream()
//                .filter(Product::getIsActive)
//                .collect(Collectors.groupingBy(
//                        Product::getCategory,
//                        Collectors.counting()
//                ));
        try {
            Optional<Object> cached = cachePort.getList(CacheKeyConstants.CATEGORY_COUNTS_KEY);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for category counts");
                return (Map<String, Long>) cached.get();
            }

            log.trace("✗ Cache MISS for category counts");

            Map<String, Long> counts = productPort.findAll().stream()
                    .collect(Collectors.groupingByConcurrent(Product::getCategory, Collectors.counting()));

            cachePort.set(CacheKeyConstants.CATEGORY_COUNTS_KEY, counts, CacheKeyConstants.CacheTTL.CATEGORY_COUNTS);

            return counts;

        } catch (Exception e) {
            log.error("Error getting category counts", e);
            throw new RuntimeException("Failed to get category counts: " + e.getMessage());
        }
    }

    @Override
//    @Cacheable(value = "productsByCategory" , key = "'active_' + #category")
    public List<ProductResponse> getActiveProductsByCategory(String category) {
        log.debug("Getting active products by category: {}", category);

        String cacheKey = CacheKeyConstants.getActiveProductByCategoryKey(category);

        try {
            Optional<Object> cached = cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for active products in category: {}", category);
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for active products in category: {}", category);
            List<Product> products = productPort.findByCategory(category).stream()
                    .filter(p -> p.getIsActive() != null && p.getIsActive())
                    .collect(Collectors.toList());

            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_ACTIVE_CATEGORY);
            return responses;

        } catch (Exception e) {
            log.error("Error getting active products by category: {}", category, e);
            throw new RuntimeException("Failed to get active products: " + e.getMessage());
        }
    }

    @Override
//    @Cacheable(value = "products" , key = "'featured'")
    public List<ProductResponse> getFeaturedProducts() {
        log.debug("[getFeaturedProducts] START");
//        return productPort.findAll()
//                .stream()
//                .filter(Product::getIsActive)
//                .filter(p -> p.getStockQuantity() > 20)
//                .sorted(Comparator.comparing(Product::getStockQuantity))
//                .limit(10)
//                .map(mapper :: mapToResponse)
//                .collect(Collectors.toList());
        try {
            Optional<Object> cached =
                    cachePort.getList(CacheKeyConstants.PRODUCT_FEATURED_KEY);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for featured products");
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for featured products");

            List<Product> featured = productPort.findAll().stream()
                    .filter(p -> p.getIsActive() != null && p.getIsActive())
                    .filter(p -> p.getStockQuantity() > 10)
                    .limit(10)
                    .collect(Collectors.toList());

            List<ProductResponse> responses = featured.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(
                    CacheKeyConstants.PRODUCT_FEATURED_KEY,
                    responses,
                    CacheKeyConstants.CacheTTL.PRODUCT_FEATURED
            );

            return responses;

        } catch (Exception e) {
            log.error("Error getting featured products", e);
            throw new RuntimeException("Failed to get featured products: " + e.getMessage());
        }

    }

    @Override
    public List<ProductResponse> getProductsPriceRange(Double minPrice, Double maxPrice) {
        log.debug("[getProductsPriceRange] START | min={} | max={}", minPrice, maxPrice);

//        return productPort.findAll()
//                .stream()
//                .filter(Product::getIsActive)
//                .filter(p -> {
//                    double price = p.getPrice().doubleValue();
//                    return price >= minPrice && price <= maxPrice;
//                })
//                .map(mapper::mapToResponse)
//                .collect(Collectors.toList());
        String cacheKey = CacheKeyConstants.getProductByPriceRangeKey(minPrice, maxPrice);
        try {
            Optional<Object> cached = cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for price range: {} - {}", minPrice, maxPrice);
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for price range: {} - {}", minPrice, maxPrice);

            List<Product> products = productPort.findAll().stream()
                    .filter(p -> p.getPrice().doubleValue() >= minPrice && p.getPrice().doubleValue() <= maxPrice)
                    .collect(Collectors.toList());

            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_PRICE_RANGE);
            return responses;

        } catch (Exception e) {
            log.error("Error getting products by price range", e);
            throw new RuntimeException("Failed to get products: " + e.getMessage());
        }
    }

    @Override
    public List<ProductResponse> getProductSortedByPrice(String order) {
        log.debug("Getting products sorted by price: {}", order);

        String cacheKey = CacheKeyConstants.getProductSortedKey(order);

        try {
            Optional<Object> cached =
                    cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for sorted products: {}", order);
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for sorted products: {}", order);

            List<Product> products = productPort.findAll();

            if ("desc".equalsIgnoreCase(order)) {
                products = products.stream()
                        .sorted((p1, p2) -> p2.getPrice().compareTo(p1.getPrice()))
                        .collect(Collectors.toList());
            } else {
                products = products.stream()
                        .sorted(Comparator.comparing(Product::getPrice))
                        .collect(Collectors.toList());
            }

            List<ProductResponse> responses = products.stream()
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_SORTED);
            return responses;

        } catch (Exception e) {
            log.error("Error getting sorted products", e);
            throw new RuntimeException("Failed to get products: " + e.getMessage());
        }
    }

    @Override
    public List<ProductResponse> compareProducts(List<Long> productIds) {
        log.debug("Comparing {} products", productIds.size());

        String cacheKey = CacheKeyConstants.getProductCompareKey(productIds);

        try {
            Optional<Object> cached =
                    cachePort.getList(cacheKey);

            if (cached.isPresent()) {
                log.trace("✓ Cache HIT for product comparison");
                return (List<ProductResponse>) cached.get();
            }

            log.trace("✗ Cache MISS for product comparison");

            List<ProductResponse> responses = productIds.stream()
                    .map(productPort::findById)
                    .filter(Optional::isPresent)
                    .map(Optional::get)
                    .map(mapper::mapToResponse)
                    .collect(Collectors.toList());

            cachePort.set(cacheKey, responses, CacheKeyConstants.CacheTTL.PRODUCT_COMPARE);
            return responses;

        } catch (Exception e) {
            log.error("Error comparing products", e);
            throw new RuntimeException("Failed to compare products: " + e.getMessage());
        }
    }

//    Helper Methods
    private String deriveOwnerType(String createdBy){
        return "ADMIN";
    }

    private void invalidateProductCreateCache() {
        log.debug("🗑️ Invalidating cache after product creation");

        String[] patterns = CacheKeyConstants.InvalidationPatterns.PRODUCT_CREATE_INVALIDATE;
        for (String pattern : patterns) {
            if (pattern.contains("*")) {
                long deleted = cachePort.deleteByPattern(pattern);
                log.trace("  Deleted {} cache keys matching pattern: {}", deleted, pattern);
            } else {
                cachePort.delete(pattern);
                log.trace("  Deleted cache key: {}", pattern);
            }
        }
    }

    private void invalidateProductUpdateCache(Long productId, String category) {
        log.debug("🗑️ Invalidating cache after product update for ID: {}", productId);

        String[] patterns = CacheKeyConstants.InvalidationPatterns.getProductUpdateInvalidate(productId, category);
        for (String pattern : patterns) {
            if (pattern.contains("*")) {
                long deleted = cachePort.deleteByPattern(pattern);
                log.trace("  Deleted {} cache keys matching pattern: {}", deleted, pattern);
            } else {
                cachePort.delete(pattern);
                log.trace("  Deleted cache key: {}", pattern);
            }
        }
    }

    private void invalidateProductDeleteCache(Long productId, String category) {
        log.debug("🗑️ Invalidating cache after product deletion for ID: {}", productId);

        String[] patterns = CacheKeyConstants.InvalidationPatterns.getProductDeleteInvalidate(productId, category);
        for (String pattern : patterns) {
            if (pattern.contains("*")) {
                long deleted = cachePort.deleteByPattern(pattern);
                log.trace("  Deleted {} cache keys matching pattern: {}", deleted, pattern);
            } else {
                cachePort.delete(pattern);
                log.trace("  Deleted cache key: {}", pattern);
            }
        }
    }

    private void invalidateStockUpdateCache(Long productId) {
        log.debug("🗑️ Invalidating cache after stock update for product ID: {}", productId);

        String[] patterns = CacheKeyConstants.InvalidationPatterns.getStockUpdateInvalidate(productId);
        for (String pattern : patterns) {
            if (pattern.contains("*")) {
                long deleted = cachePort.deleteByPattern(pattern);
                log.trace("  Deleted {} cache keys matching pattern: {}", deleted, pattern);
            } else {
                cachePort.delete(pattern);
                log.trace("  Deleted cache key: {}", pattern);
            }
        }
    }
}
