package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.print.attribute.standard.Media;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product")
@CrossOrigin("*")
public class ProductController{

    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService = productService;
    }

    @PostMapping(value = "/admin/create" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> adminCreateProduct(@RequestPart("product") ProductRequest request, @RequestPart(value = "image" , required = false)MultipartFile image, @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String createdBy = userDetails.getUsername();
            ProductResponse response = productService.createProduct(request, image ,createdBy);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Product created by ADMIN",
                    "product", response,
                    "createdBy", createdBy,
                    "role", "ADMIN"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Failed to create product",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Map<String, Object>> adminViewAllProducts(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.getAllProducts();
        Map<String, Object> stats = productService.getProductStatistics();

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("totalCount", products.size());
        response.put("statistics", stats);
        response.put("accessedBy", userDetails.getUsername());
        response.put("role", "ADMIN");
        response.put("message", "Full admin access to all products");

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> adminDeleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Product permanently deleted by ADMIN",
                    "productId", id,
                    "deletedBy", userDetails.getUsername()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Product not found",
                    "details", e.getMessage()
            ));
        }
    }

    @PutMapping("/admin-type1/update-stock/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1')")
    public ResponseEntity<?> adminType1UpdateStock(@PathVariable Long id, @RequestParam Integer quantity, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ProductResponse response = productService.updateProductStock(id, quantity, userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Stock updated by ADMIN_TYPE1",
                    "product", response,
                    "newStock", response.getStockQuantity(),
                    "updatedBy", userDetails.getUsername()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Failed to update stock",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/admin-type1/low-stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1')")
    public ResponseEntity<Map<String, Object>> adminType1ViewLowStock(@RequestParam(defaultValue = "10") Integer threshold, @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> lowStockProducts = productService.findLowStockProducts(threshold);

        Map<String, Object> response = new HashMap<>();
        response.put("products", lowStockProducts);
        response.put("count", lowStockProducts.size());
        response.put("threshold", threshold);
        response.put("role", "ADMIN_TYPE1");
        response.put("message", "Low stock alert - Inventory management");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin-type1/bulk-update-stock")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1')")
    public ResponseEntity<?> adminType1BulkUpdateStock(@RequestBody Map<Long, Integer> stockUpdates , @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ProductResponse> updated = productService.bulkUpdateStock(stockUpdates, userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Bulk stock update completed",
                    "updatedProducts", updated,
                    "count", updated.size(),
                    "updatedBy", userDetails.getUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Bulk update failed",
                    "details", e.getMessage()
            ));
        }
    }

//  Admin + Admin 2 & User + User2 Endpoints

    @PutMapping(value = "/admin-type2/update-price/{id}" , consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<?> adminType2UpdatePrice(@PathVariable Long id, @RequestPart("product") ProductRequest request, @RequestPart(value="image" , required = false) MultipartFile image , @AuthenticationPrincipal UserDetails userDetails) {
        try{
            ProductResponse response = productService.updateProduct(id, request, image ,userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Price updated by ADMIN_TYPE2",
                    "product", response,
                    "newPrice", response.getPrice(),
                    "updatedBy", userDetails.getUsername()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Failed to update price",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/admin-type2/category/{category}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<Map<String, Object>> adminType2ViewByCategory(@PathVariable String category , @AuthenticationPrincipal UserDetails userDetails) {
        List<ProductResponse> products = productService.getProductsByCategory(category);
        Map<String, Object> priceAnalysis = productService.getCategoryPriceAnalysis(category);

        Map<String, Object> response = new HashMap<>();
        response.put("category", category);
        response.put("products", products);
        response.put("count", products.size());
        response.put("priceAnalysis", priceAnalysis);
        response.put("role", "ADMIN_TYPE2");

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin-type2/toggle-active/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<?> adminType2ToggleActive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            ProductResponse response = productService.toggleProductActive(id, userDetails.getUsername());

            return ResponseEntity.ok(Map.of(
                    "message", "Product status toggled",
                    "product", response,
                    "isActive", response.getIsActive(),
                    "updatedBy", userDetails.getUsername()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Product not found",
                    "details", e.getMessage()
            ));
        }
    }

    @GetMapping("/user-type2/sorted")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<Map<String, Object>> userType2ViewSortedByPrice(
            @RequestParam(defaultValue = "asc") String order,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.getProductSortedByPrice(order);

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("count", products.size());
        response.put("sortOrder", order);
        response.put("role", "USER_TYPE2");
        response.put("message", "Products sorted by price (" + order + ")");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/user-type2/compare")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<Map<String, Object>> userType2CompareProducts(
            @RequestBody List<Long> productIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<ProductResponse> products = productService.compareProducts(productIds);

            Map<String, Object> response = new HashMap<>();
            response.put("products", products);
            response.put("count", products.size());
            response.put("role", "USER_TYPE2");
            response.put("message", "Product comparison");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Comparison failed",
                    "details", e.getMessage()
            ));
        }
    }

//    (Admin + Admin1) & (User + User1)

    @GetMapping("/user/details/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1', 'USER', 'USER_TYPE1')")
    public ResponseEntity<?> userViewProductDetails(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);

            // Users can only see active products
            if (!product.getIsActive()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "error", "Product not available"
                ));
            }

            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Product not found",
                    "details", e.getMessage()
            ));
        }
    }


    @GetMapping("/user/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1', 'USER', 'USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> userSearchProducts(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.searchProductByName(keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("keyword", keyword);
        response.put("products", products);
        response.put("count", products.size());
        response.put("role", "USER");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type1/categories")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1', 'USER', 'USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> userType1ViewCategories(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<String> categories = productService.getAllCategories();
        Map<String, Long> categoryCounts = productService.getCategoryCounts();

        Map<String, Object> response = new HashMap<>();
        response.put("categories", categories);
        response.put("totalCategories", categories.size());
        response.put("categoryCounts", categoryCounts);
        response.put("role", "USER_TYPE1");
        response.put("message", "Category browser access");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type1/category/{category}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1', 'USER', 'USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> userType1ViewByCategory(
            @PathVariable String category,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.getActiveProductsByCategory(category);

        Map<String, Object> response = new HashMap<>();
        response.put("category", category);
        response.put("products", products);
        response.put("count", products.size());
        response.put("role", "USER_TYPE1");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type1/featured")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE1', 'USER', 'USER_TYPE1')")
    public ResponseEntity<Map<String, Object>> userType1ViewFeatured(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.getFeaturedProducts();

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("count", products.size());
        response.put("role", "USER_TYPE1");
        response.put("message", "Featured products with high availability");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-type2/price-range")
    public ResponseEntity<Map<String, Object>> userType2ViewByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice,
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ProductResponse> products = productService.getProductsPriceRange(minPrice, maxPrice);

        Map<String, Object> response = new HashMap<>();
        response.put("minPrice", minPrice);
        response.put("maxPrice", maxPrice);
        response.put("products", products);
        response.put("count", products.size());
        response.put("role", "USER_TYPE2");

        return ResponseEntity.ok(response);
    }


}
