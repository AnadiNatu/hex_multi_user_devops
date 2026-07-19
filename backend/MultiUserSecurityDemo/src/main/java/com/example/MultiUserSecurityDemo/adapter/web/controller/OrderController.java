package com.example.MultiUserSecurityDemo.adapter.web.controller;

import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType1Details;
import com.example.MultiUserSecurityDemo.adapter.security.user_details.UserType2Details;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//@CrossOrigin(origins = {"http://localhost:5173","http://localhost:4200"})

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyAuthority('ADMIN' , 'ADMIN_TYPE2' , 'USER' , 'USER_TYPE2')")
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            String email    = userDetails.getUsername();
            String fullName = resolveFullName(userDetails);

            OrderResponse response = orderService.createOrder(request, email, fullName);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Order created successfully",
                    "order",   response
            ));
        } catch (Exception e) {
            log.error("[createOrder] ERROR | error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "error",   "Failed to create order",
                    "details", e.getMessage()
            ));
        }
    }

//    Logged In User's own orders
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ADMIN' , 'ADMIN_TYPE2' , 'USER' , 'USER_TYPE2')")
    public ResponseEntity<Map<String, Object>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {

        String email = userDetails.getUsername();
        List<OrderResponse> orders = orderService.getOrdersByUser(email);

        Map<String, Object> response = new HashMap<>();
        response.put("orders",     orders);
        response.put("totalCount", orders.size());
        response.put("userEmail",  email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyAuthority('ADMIN' , 'ADMIN_TYPE2')")
    public ResponseEntity<Map<String, Object>> getAllOrders(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<OrderResponse> orders = orderService.getAllOrders();

        Map<String, Object> response = new HashMap<>();
        response.put("orders",     orders);
        response.put("totalCount", orders.size());
        response.put("accessedBy", userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ADMIN_TYPE2', 'USER', 'USER_TYPE2')")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            OrderResponse order = orderService.getOrderById(id);

            // Non-admin users can only view their own orders
            boolean isAdmin = isAdminUser(userDetails);
            if (!isAdmin && !order.getUserId().equals(userDetails.getUsername())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Order not found", "details", e.getMessage()));
        }
    }

    @PutMapping("/admin/status/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN' , 'ADMIN_TYPE2')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            OrderResponse updated =
                    orderService.updateOrderStatus(id, status, userDetails.getUsername());
            return ResponseEntity.ok(Map.of(
                    "message",   "Order status updated",
                    "order",     updated,
                    "updatedBy", userDetails.getUsername()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error",   "Invalid status value",
                    "details", e.getMessage()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error",   "Order not found",
                    "details", e.getMessage()
            ));
        }
    }

//    Helpers
private String resolveFullName(UserDetails userDetails) {
    if (userDetails instanceof UserType1Details d) {
        return d.getUser().getFname() + " " + d.getUser().getLname();
    }
    if (userDetails instanceof UserType2Details d) {
        return d.getUser().getFname() + " " + d.getUser().getLname();
    }
    return userDetails.getUsername();
}

    private boolean isAdminUser(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().startsWith("ADMIN") ||
                        a.getAuthority().equals("ADMIN_TYPE2"));
    }
}
