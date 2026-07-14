package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.persistence.mapper.ProductMapper;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.ProductService;
import com.example.MultiUserSecurityDemo.domain.model.Product;
import com.example.MultiUserSecurityDemo.domain.port.ProductPort;
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
@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductPort productPort;

    @Autowired
    private ProductMapper mapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Override
    @Caching(evict = {
            @CacheEvict(value = "products" , allEntries = true),
            @CacheEvict(value = "productsByCategory" , allEntries = true),
            @CacheEvict(value = "productStatistics" , allEntries = true),
            @CacheEvict(value = "categories" , allEntries = true)
    })
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
            Product product = productPort.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

            product.setName(request.getName());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setStockQuantity(request.getStockQuantity());
            product.setCategory(request.getCategory());
//            product.setImageUrl(request.getImageUrl());
            product.setIsActive(request.getIsActive());
            product.setUpdatedAt(LocalDateTime.now());
            product.setUpdatedBy(updatedBy);

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
    @Cacheable(value = "products" , key="#id")
    public ProductResponse getProductById(Long id) {
        StopWatch sw = new StopWatch("getProductById");
        sw.start();
        log.debug("[getProductById] START | id={}" , id);

        try {
            Product product = productPort.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
            sw.stop();
            return mapper.mapToResponse(product);
        }catch (Exception ex){
            sw.stop();
            log.error("[getProductById] ERROR | id={} | duration={}ms | error={}" , id , sw.getTotalTimeMillis() , ex.getMessage());
            throw ex;
        }
    }

    @Override
    @Cacheable(value = "products" , key = "'all'")
    public List<ProductResponse> getAllProducts() {
        StopWatch sw = new StopWatch("getAllProducts");
        sw.start();
        log.debug("[getAllProducts] START");

        List<ProductResponse> result = productPort.findAll()
                .stream()
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());

        sw.stop();
        log.info("[getAllProducts] SUCCESS | count={} | duration={}ms", result.size(), sw.getTotalTimeMillis());
        return result;
    }

    @Override
    @Cacheable(value = "productsByCategory" , key = "#category")
    public List<ProductResponse> getProductsByCategory(String category) {
        StopWatch sw = new StopWatch("getProductsByCategory");
        sw.start();
        log.debug("[getProductsByCategory] START | category={}", category);

        List<ProductResponse> result = productPort.findByCategory(category)
                .stream()
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());

        sw.stop();
        log.info("[getProductByCategory] SUCCESS | category={}" , category);
        return result;
    }


    @Override
    @Caching(evict = {
            @CacheEvict(value = "products" , allEntries = true),
            @CacheEvict(value = "productsByCategory" , allEntries = true),
            @CacheEvict(value = "productStatistics" , allEntries = true),
            @CacheEvict(value = "categories" , allEntries = true)
    })
    public void deleteProduct(Long id) {
        StopWatch sw = new StopWatch("deleteProduct");
        sw.start();
        log.info("[deleteProduct] START | id={}" , id);

        if (!productPort.existsById(id)) {
            sw.stop();
            log.warn("[deleteProduct] NOT_FOUND | id={} | duration={}ms", id, sw.getTotalTimeMillis());
            throw new RuntimeException("Product not found with id: " + id);
        }
        productPort.deleteById(id);
        sw.stop();
        log.info("[deleteProduct] SUCCESS | id={} | duration={}ms", id, sw.getTotalTimeMillis());
    }

    @Override
    @Cacheable(value = "productStatistics" , key = "'stats'")
    public Map<String, Object> getProductStatistics() {
        StopWatch sw = new StopWatch("getProductStatics");
        sw.start();
        log.debug("[getProductStatistics] START");

        List<Product> allProducts = productPort.findAll();
        List<Product> activeProducts = productPort.findByIsActive(true);

        long totalProducts = allProducts.size();
        long activeCount = activeProducts.size();
        long inactiveCount = totalProducts - activeCount;

        double totalValue = allProducts.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                .reduce(BigDecimal.ZERO , BigDecimal::add)
                .doubleValue();

        Map<String , Object> stats = new HashMap<>();
        stats.put("totalProducts" , totalProducts);
        stats.put("activeProducts" , activeCount);
        stats.put("inactive" , inactiveCount);
        stats.put("totalInventoryValue" , totalValue);
        stats.put("totalStock" , allProducts.stream().mapToInt(Product::getStockQuantity).sum());

        sw.stop();
        log.info("[getProductStatistics] SUCCESS | totalProducts={} | duration={}ms" , totalProducts , sw.getTotalTimeMillis());
        return stats;
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
        log.debug("[findLowStockProducts] START | threshold={}", threshold);

        return productPort.findAll()
                .stream()
                .filter(p -> p.getStockQuantity() <= threshold)
                .filter(Product::getIsActive)
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = "productStatistics" , allEntries = true)
    public List<ProductResponse> bulkUpdateStock(Map<Long, Integer> stockUpdates, String updatedBy) {
        StopWatch sw = new StopWatch("bulkUpdateStock");
        sw.start();
        log.info("[bulkUpdateStock] START | count={} | updatedBy={}", stockUpdates.size(), updatedBy);

        List<ProductResponse> updatedProducts = new ArrayList<>();

        for (Map.Entry<Long, Integer> entry : stockUpdates.entrySet()) {
            try {
                ProductResponse updated = updateProductStock(entry.getKey(), entry.getValue(), updatedBy);
                updatedProducts.add(updated);
            } catch (RuntimeException e) {
                log.warn("[bulkUpdateStock] SKIP | id={} | reason={}", entry.getKey(), e.getMessage());
            }
        }
        sw.stop();
        log.info("[bulkUpdateStock] SUCCESS | updated={} | duration={}ms", updatedProducts.size(), sw.getTotalTimeMillis());
        return updatedProducts;
    }

    @Override
    @Cacheable(value = "productsByCategory" , key = "'analysis_' + #category")
    public Map<String, Object> getCategoryPriceAnalysis(String category) {
        log.debug("[getCategoryPriceAnalysis] START | category={}", category);
        List<Product> products = productPort.findByCategory(category);

        if (products.isEmpty()) {
            return Map.of(
                    "category", category,
                    "count", 0,
                    "message", "No products in this category"
            );
        }

        DoubleSummaryStatistics priceStats = products.stream()
                .map(Product::getPrice)
                .mapToDouble(BigDecimal::doubleValue)
                .summaryStatistics();

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("category", category);
        analysis.put("productCount", products.size());
        analysis.put("averagePrice", priceStats.getAverage());
        analysis.put("minPrice", priceStats.getMin());
        analysis.put("maxPrice", priceStats.getMax());
        analysis.put("totalValue", priceStats.getSum());

        log.debug("[getCategoryPriceAnalysis] SUCCESS | category={} | count={}", category, products.size());
        return analysis;
    }

    @Caching(
            evict = {
                    @CacheEvict(value = "products", allEntries = true),
                    @CacheEvict(value = "productsByCategory", allEntries = true),
                    @CacheEvict(value = "productStatistics", allEntries = true),
                    @CacheEvict(value = "categories", allEntries = true)
            }
    )
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

        List<ProductResponse> result =  productPort.findAll()
                .stream()
                .filter(Product::getIsActive)
                .filter(p -> p.getName().toLowerCase().contains(keyword.toLowerCase()))
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());

        log.debug("[searchProductByName] SUCCESS | keyword={} | found={}" , keyword , result.size());
        return result;
    }

    @Override
    @Cacheable(value = "categories" , key = "'all'")
    public List<String> getAllCategories() {
        log.debug("[getAllCategories] START");
        return productPort.findAll()
                .stream()
                .map(Product::getCategory)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "categories" , key = "'counts'")
    public Map<String, Long> getCategoryCounts() {
        log.debug("[getCategoryCounts] START");
        return productPort
                .findAll()
                .stream()
                .filter(Product::getIsActive)
                .collect(Collectors.groupingBy(
                        Product::getCategory,
                        Collectors.counting()
                ));
    }

    @Override
    @Cacheable(value = "productsByCategory" , key = "'active_' + #category")
    public List<ProductResponse> getActiveProductsByCategory(String category) {
        log.debug("[getActiveProductsByCategory] START | category={}" , category);
        return productPort.findByCategory(category)
                .stream()
                .filter(Product :: getIsActive)
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "products" , key = "'featured'")
    public List<ProductResponse> getFeaturedProducts() {
        log.debug("[getFeaturedProducts] START");
        return productPort.findAll()
                .stream()
                .filter(Product::getIsActive)
                .filter(p -> p.getStockQuantity() > 20)
                .sorted(Comparator.comparing(Product::getStockQuantity))
                .limit(10)
                .map(mapper :: mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductsPriceRange(Double minPrice, Double maxPrice) {
        log.debug("[getProductsPriceRange] START | min={} | max={}", minPrice, maxPrice);

        return productPort.findAll()
                .stream()
                .filter(Product::getIsActive)
                .filter(p -> {
                    double price = p.getPrice().doubleValue();
                    return price >= minPrice && price <= maxPrice;
                })
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> getProductSortedByPrice(String order) {
        log.debug("[getProductSortedByPrice] START | order={}", order);

        Comparator<Product> comparator = order.equalsIgnoreCase("desc")
                ? Comparator.comparing(Product::getPrice).reversed()
                : Comparator.comparing(Product::getPrice);

        return productPort.findAll()
                .stream()
                .filter(Product::getIsActive)
                .sorted(comparator)
                .map(mapper :: mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductResponse> compareProducts(List<Long> productIds) {
        log.debug("[compareProducts] START | ids={}", productIds);

        return productIds.stream()
                .map(id -> productPort.findById(id).orElse(null))
                .filter(Objects::nonNull)
                .filter(Product::getIsActive)
                .map(mapper::mapToResponse)
                .collect(Collectors.toList());
    }

//    Helper Methods
    private String deriveOwnerType(String createdBy){
        return "ADMIN";
    }
}
