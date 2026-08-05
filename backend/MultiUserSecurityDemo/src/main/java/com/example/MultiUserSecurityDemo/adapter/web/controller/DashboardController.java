package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.web.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})
public class DashboardController {

    private final ProductService productService;

    public DashboardController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(
            @AuthenticationPrincipal UserDetails userDetails) {

        Map<String, Object> productStats = productService.getProductStatistics();

        // Merge product stats with any future order stats
        Map<String, Object> combined = new HashMap<>(productStats);

        // Placeholder order stats — replace with real values once OrderService exists
        combined.put("totalOrders",     0);
        combined.put("pendingOrders",   0);
        combined.put("completedOrders", 0);
        combined.put("totalRevenue",    0.0);

        combined.put("accessedBy", userDetails.getUsername());

        return ResponseEntity.ok(combined);
    }
}
