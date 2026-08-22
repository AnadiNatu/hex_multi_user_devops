package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.persistence.RedisCacheAdapter;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.OrderService;
import com.example.MultiUserSecurityDemo.config.constants.CacheKeyConstants;
import com.example.MultiUserSecurityDemo.domain.model.Order;
import com.example.MultiUserSecurityDemo.domain.model.OrderItem;
import com.example.MultiUserSecurityDemo.domain.port.CachePort;
import com.example.MultiUserSecurityDemo.domain.port.OrderPort;
import com.example.MultiUserSecurityDemo.domain.port.ProductPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderPort orderPort;
    private final ProductPort productPort;
    private final CachePort cachePort;
    private final RedisCacheAdapter redisCacheAdapter;

    @Override
    public OrderResponse createOrder(OrderRequest request, String userEmail, String userName) {
        log.info(
                "[createOrder] START | userEmail={} | items={}",
                userEmail,
                request.getItems() == null ? 0 : request.getItems().size()
        );

        try {
            if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
                throw new IllegalArgumentException("Order must contain at least one item");
            }

            Order order = new Order();

            order.setUserEmail(userEmail);
            order.setUserName(userName);
            order.setStatus("PENDING");
            order.setCreatedAt(LocalDateTime.now());

            List<OrderItem> orderItems = new ArrayList<>();
            BigDecimal total = BigDecimal.ZERO;

            for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {

                if (itemReq.getProductId() == null) {
                    throw new IllegalArgumentException("Product ID cannot be null");
                }

                if (itemReq.getQuantity() == null || itemReq.getQuantity() < 1) {
                    throw new IllegalArgumentException(
                            "Quantity must be at least 1 for product: "
                                    + itemReq.getProductId()
                    );
                }

                var productOpt = productPort.findById(itemReq.getProductId());

                if (productOpt.isEmpty()) {
                    throw new RuntimeException(
                            "Product not found: " + itemReq.getProductId()
                    );
                }

                var product = productOpt.get();

                if (product.getPrice() == null) {
                    throw new RuntimeException(
                            "Product has no price: " + itemReq.getProductId()
                    );
                }

                BigDecimal unitPrice = product.getPrice();

                BigDecimal subtotal = unitPrice.multiply(
                        BigDecimal.valueOf(itemReq.getQuantity())
                );

                OrderItem item = new OrderItem();

                item.setOrder(order);
                item.setProductId(product.getId());
                item.setProductName(product.getName());
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(unitPrice);
                item.setSubtotal(subtotal);

                orderItems.add(item);

                total = total.add(subtotal);
            }

            order.setItems(orderItems);
            order.setTotalAmount(total);

            Order savedOrder = orderPort.save(order);

            invalidateOrderCreateCache(userEmail);

            log.info(
                    "[createOrder] SUCCESS | id={} | items={} | total={}",
                    savedOrder.getId(),
                    orderItems.size(),
                    total
            );

            return toResponse(savedOrder);

        } catch (Exception e) {
            log.error(
                    "[createOrder] FAILED | userEmail={}",
                    userEmail,
                    e
            );

            throw new RuntimeException(
                    "Failed to create order: " + e.getMessage(),
                    e
            );
        }
    }

//    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getAllOrders() {
        log.debug("");

        try {
            // 1 - TRY CACHE
            Optional<Object> cachedOrders = cachePort.getList(CacheKeyConstants.ORDER_ALL_KEY);

            if (cachedOrders.isPresent()) {
                log.trace("");
                return (List<OrderResponse>) cachedOrders.get();
            }
            // 2 - CACHE MISS : QUERY DATABASE
            log.trace("");
            List<Order> orders = orderPort.findAll();
            List<OrderResponse> responses = orders.stream().map(this::toResponse).collect(Collectors.toList());

            // 3 - Cache the result
            cachePort.set(CacheKeyConstants.ORDER_ALL_KEY, responses, CacheKeyConstants.CacheTTL.ORDER_ALL);

            log.trace("");
            return responses;
        } catch (Exception ex) {
            log.error("");
            throw new RuntimeException("Failed to get orders : " + ex.getMessage());
        }
    }


//    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getOrdersByUser(String userEmail) {
//        return orderPort.findByUserEmail(userEmail).stream()
//                .map(this::toResponse)
//                .collect(Collectors.toList());
        log.debug("");
        String cacheKey = CacheKeyConstants.getOrderByUserKey(userEmail);

        try{
            // TRY CACHE
            Optional<Object> cachedOrders = cachePort.getList(cacheKey);

            if (cachedOrders.isPresent()){
                log.trace("");
                return (List<OrderResponse>) cachedOrders.get();
            }

            // CACHE MISS : Query database
            log.trace("");
            List<Order> orders = orderPort.findByUserEmail(userEmail);
            List<OrderResponse> responses = orders.stream().map(this::toResponse).collect(Collectors.toList());

            // CACHE RESULT
            cachePort.set(cacheKey , responses , CacheKeyConstants.CacheTTL.ORDER_BY_USER);

            log.trace("✓ Cached orders for user: {} ({} items)", userEmail, responses.size());
            return responses;

        } catch (Exception e) {
            log.error("Error getting orders for user: {}", userEmail, e);
            throw new RuntimeException("Failed to get user orders: " + e.getMessage());
        }

    }

    @Override
    public OrderResponse updateOrderStatus(Long id, String status, String updatedBy) {
        log.info("Updating order ID: {} status to: {} by: {}", id, status, updatedBy);
        try {
            Order order = orderPort.findById(id).orElseThrow(() -> new RuntimeException("Order not found: " + id));

            // Validate status value
            if (!List.of("PENDING", "PROCESSING" , "COMPLETED", "CANCELLED", "SHIPPED" , "DELIVERED").contains(status.toUpperCase())) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }

            String oldStatus = order.getStatus();
            String userEmail = order.getUserEmail();

            order.setStatus(status.toUpperCase());
            order.setUpdatedAt(LocalDateTime.now());
            Order updated = orderPort.save(order);

            // Invalidate cache
            invalidateOrderStatusUpdateCache(id, oldStatus, status, userEmail);

            log.info("[updateOrderStatus] id={} | status={} | by={}", id, status, updatedBy);
            return toResponse(updated);
        } catch (Exception e) {
            log.error("Error updating order status", e);
            throw new RuntimeException("Failed to update order: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    @Override
    public OrderResponse getOrderById(Long id) {

        log.debug("");

        String cacheKey = CacheKeyConstants.getOrderByIdKey(id);

        try{
            Optional<OrderResponse> cachedOrder = cachePort.getSingle(cacheKey , OrderResponse.class);

            if (cachedOrder.isPresent()){
                log.trace("Cache HIT for order ID : {}" , id);
                return cachedOrder.get();
            }
            // 2 - CACHE MISS :- Will try DB then
            log.trace("");
            Optional<Order> order  = orderPort.findById(id);

            if (order.isEmpty()){
                log.warn("");
                throw new RuntimeException("Order not found with ID : " + id);
            }

            OrderResponse response =  toResponse(order.get());

            // 3 - CACHE THE RESULT
            boolean cached = cachePort.set(cacheKey , response , CacheKeyConstants.CacheTTL.ORDER_BY_ID);

            if (!cached){
                log.warn("");
            }else {
                log.trace("");
            }
            return response;
        }catch (Exception ex){
            log.error("");
            throw new RuntimeException("Failed to get order : " + ex.getMessage());
        }
    }

    @Override
    public OrderResponse cancelOrder(Long id, String userEmail) {
        log.info("Cancelling order ID: {} for user: {}", id, userEmail);

        try {
            Order order = orderPort.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

            if (!order.getUserEmail().equals(userEmail)) {
                log.warn("User {} attempted to cancel order {} belonging to {}", userEmail, id, order.getUserEmail());
                throw new RuntimeException("You cannot cancel another user's order.");
            }

//        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
//            throw new RuntimeException("Only pending orders can be cancelled.");
//        }

            String oldStatus = order.getStatus();

            order.setStatus("CANCELLED");
            order.setUpdatedAt(LocalDateTime.now());
            Order updated = orderPort.save(order);

            // Invalidate cache
            invalidateOrderStatusUpdateCache(id, oldStatus, "CANCELLED", userEmail);
            log.info("✓ Order ID: {} cancelled by user: {}", id, userEmail);
            return toResponse(updated);
        }catch ( Exception ex) {
            log.error("Error cancelling order", ex);
            throw new RuntimeException("Failed to cancel order: " + ex.getMessage());
        }
        }

    @Override
    public void deleteOwnOrder(Long id, String userEmail) {
        log.info("User {} requesting to delete order ID: {}", userEmail, id);

        try{
        Order order = orderPort.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            log.warn("User {} attempted to delete order {} belonging to {}", userEmail, id, order.getUserEmail());
            throw new RuntimeException("Access denied");
        }

            if (!Arrays.asList("PENDING", "CANCELLED").contains(order.getStatus())) {
                throw new RuntimeException("Cannot delete order with status: " + order.getStatus());
            }

            // 2 DELETE from DB
            orderPort.deleteById(id);

            // 3 Invalidate cache
            invalidateOrderDeleteCache(id, userEmail);

            log.info("✓ Order ID: {} deleted by user: {}", id, userEmail);

        } catch (Exception e) {
            log.error("Error deleting order", e);
            throw new RuntimeException("Failed to delete order: " + e.getMessage());
        }
    }

    @Override
    public void deleteOrder(Long id) {

        log.info("Admin deleting order ID: {}", id);

        try {
            // 1️ - GET order before deletion
            Order order = orderPort.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found: " + id));

            String userEmail = order.getUserEmail();

            // 2 - DELETE from database
            orderPort.deleteById(id);

            // 3️ - INVALIDATE cache
            invalidateOrderDeleteCache(id, userEmail);

            log.info("✓ Order ID: {} deleted by admin", id);

        } catch (Exception e) {
            log.error("Error deleting order", e);
            throw new RuntimeException("Failed to delete order: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getOrdersByStatus(String status) {
        log.debug("");
        String cacheKey = CacheKeyConstants.getOrderByStatusKey(status);

        try{
            // 1 - Try cause
            Optional<Object> cacheOrders = cachePort.getList(cacheKey);

            if (cacheOrders.isPresent()) {
                log.trace("✓ Cache HIT for status: {}", status);
                return (List<OrderResponse>) cacheOrders.get();
            }

            // 2 - CACHE MISS - Query database
            log.trace("✗ Cache MISS for status: {}", status);
            List<Order> orders = orderPort.findByStatus(status);
            List<OrderResponse> responses = orders.stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());

            // 3 - Cache the result
            cachePort.set(cacheKey , responses , CacheKeyConstants.CacheTTL.ORDER_BY_STATUS);

            log.trace("✓ Cached orders for status: {} ({} items)", status, responses.size());
            return responses;

        } catch (Exception e) {
            log.error("Error getting orders by status: {}", status, e);
            throw new RuntimeException("Failed to get orders by status: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getOrdersByUserEmail(String email) {

        return orderPort.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Helper
    private OrderResponse toResponse(Order order) {
        List<OrderItem> items = order.getItems() == null ? Collections.emptyList()
                        : new ArrayList<>(order.getItems());

        List<OrderResponse.OrderItemResponse> itemResponses =
                items.stream().map(item -> OrderResponse.OrderItemResponse.builder()
                                        .id(String.valueOf(item.getId()))
                                        .productId(String.valueOf(item.getProductId()))
                                        .productName(item.getProductName())
                                        .quantity(item.getQuantity())
                                        .price(item.getPrice())
                                        .subtotal(item.getSubtotal())
                                        .build()).toList();

        return OrderResponse.builder()
                .id(String.valueOf(order.getId()))
                .userId(order.getUserEmail())
                .userName(order.getUserName())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt().toString())
                .updatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().toString() : null)
                .build();
    }

    private void cacheOrderResponse(OrderResponse response) {
        try {
            redisCacheAdapter.set("order:" + response.getId(), response , Duration.ofMinutes(30));
        } catch (Exception e) {
            // Log but don't fail the request
            log.warn("[cacheOrderResponse] Failed to cache order: {}", e.getMessage());
        }
    }

    private void invalidateOrderCreateCache(String userEmail) {
        log.debug("🗑️ Invalidating cache after order creation for user: {}", userEmail);

        // Clear all orders cache
        cachePort.delete(CacheKeyConstants.ORDER_ALL_KEY);
        log.trace("  Deleted cache key: {}", CacheKeyConstants.ORDER_ALL_KEY);

        // Clear user's specific orders cache
        String userOrdersKey = CacheKeyConstants.getOrderByUserKey(userEmail);
        cachePort.delete(userOrdersKey);
        log.trace("  Deleted cache key: {}", userOrdersKey);

        // Clear all status caches (new order might affect status distributions)
        long deletedStatus = cachePort.deleteByPattern(CacheKeyConstants.ORDER_PATTERN);
        log.trace("  Deleted {} cache keys matching pattern: {}", deletedStatus, CacheKeyConstants.ORDER_PATTERN);
    }

    private void invalidateOrderStatusUpdateCache(Long orderId, String oldStatus, String newStatus, String userEmail) {
        log.debug("🗑️ Invalidating cache after order status update from {} to {}", oldStatus, newStatus);

        // Clear specific order cache
        String orderKey = CacheKeyConstants.getOrderByIdKey(orderId);
        cachePort.delete(orderKey);
        log.trace("  Deleted cache key: {}", orderKey);

        // Clear all orders cache
        cachePort.delete(CacheKeyConstants.ORDER_ALL_KEY);
        log.trace("  Deleted cache key: {}", CacheKeyConstants.ORDER_ALL_KEY);

        // Clear old status cache
        String oldStatusKey = CacheKeyConstants.getOrderByStatusKey(oldStatus);
        cachePort.delete(oldStatusKey);
        log.trace("  Deleted cache key: {}", oldStatusKey);

        // Clear new status cache
        String newStatusKey = CacheKeyConstants.getOrderByStatusKey(newStatus);
        cachePort.delete(newStatusKey);
        log.trace("  Deleted cache key: {}", newStatusKey);

        // Clear user's orders cache
        String userOrdersKey = CacheKeyConstants.getOrderByUserKey(userEmail);
        cachePort.delete(userOrdersKey);
        log.trace("  Deleted cache key: {}", userOrdersKey);
    }

    private void invalidateOrderDeleteCache(Long orderId, String userEmail) {
        log.debug("🗑️ Invalidating cache after order deletion for ID: {}", orderId);

        // Clear specific order cache
        String orderKey = CacheKeyConstants.getOrderByIdKey(orderId);
        cachePort.delete(orderKey);
        log.trace("  Deleted cache key: {}", orderKey);

        // Clear all orders cache
        cachePort.delete(CacheKeyConstants.ORDER_ALL_KEY);
        log.trace("  Deleted cache key: {}", CacheKeyConstants.ORDER_ALL_KEY);

        // Clear user's orders cache
        String userOrdersKey = CacheKeyConstants.getOrderByUserKey(userEmail);
        cachePort.delete(userOrdersKey);
        log.trace("  Deleted cache key: {}", userOrdersKey);

        // Clear status caches (deleted order affects status distributions)
        long deletedStatus = cachePort.deleteByPattern(CacheKeyConstants.ORDER_PATTERN);
        log.trace("  Deleted {} cache keys matching pattern: {}", deletedStatus, CacheKeyConstants.ORDER_PATTERN);
    }

}
