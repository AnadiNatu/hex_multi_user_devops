package com.example.MultiUserSecurityDemo.adapter.web.service;

import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request , MultipartFile image , String createdBy); // Done No Errors
    ProductResponse updateProduct(Long id , ProductRequest request , MultipartFile image , String updatedBy); // Done No Errors
    ProductResponse getProductById(Long id); // Done No Errors
    List<ProductResponse> getAllProducts(); // Done No Errors
    List<ProductResponse> getProductsByCategory(String category); // Done No Errors
    void deleteProduct(Long id); // Done No Errors

    Map<String , Object> getProductStatistics(); // Done No Errors

    ProductResponse updateProductStock(Long id , Integer quantity , String updatedBy); // Done No Errors
    List<ProductResponse> findLowStockProducts(Integer threshold); // Done No Errors
    List<ProductResponse> bulkUpdateStock(Map<Long , Integer> stockUpdates , String updatedBy); // Done No Errors

    Map<String , Object> getCategoryPriceAnalysis(String category); // Done No Errors
    ProductResponse toggleProductActive(Long id , String updatedBy); // Done No Errors

    List<ProductResponse> searchProductByName(String keyword); // Done No Errors

    List<String> getAllCategories(); // Done No Errors
    Map<String , Long> getCategoryCounts(); // Done No Errors
    List<ProductResponse> getActiveProductsByCategory(String category); // Done No Errors
    List<ProductResponse> getFeaturedProducts(); // Done No Errors

    List<ProductResponse> getProductsPriceRange(Double minPrice , Double maxPrice); // Done No Errors
    List<ProductResponse> getProductSortedByPrice(String order); //Done No Errors
    List<ProductResponse> compareProducts(List<Long> productIds); //Done No Errors
}
