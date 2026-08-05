package com.example.MultiUserSecurityDemo.adapter.web.service.impl;

import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderResponse;
import com.example.MultiUserSecurityDemo.adapter.web.service.OrderService;
import com.example.MultiUserSecurityDemo.domain.model.Order;
import com.example.MultiUserSecurityDemo.domain.model.OrderItem;
import com.example.MultiUserSecurityDemo.domain.port.OrderPort;
import com.example.MultiUserSecurityDemo.domain.port.ProductPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderServiceImpl implements OrderService {

    private final OrderPort orderPort;
    private final ProductPort productPort;

    public OrderServiceImpl(OrderPort orderPort, ProductPort productPort) {
        this.orderPort = orderPort;
        this.productPort = productPort;
    }


    @Override
    public OrderResponse createOrder(OrderRequest request, String userEmail, String userName) {
        log.info("[createOrder] START | userEmail={} | items={}", userEmail,
                request.getItems() == null ? 0 : request.getItems().size());

        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setUserName(userName);
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            var productOpt = productPort.findById(itemReq.getProductId());
            if (productOpt.isEmpty()) {
                log.warn("[createOrder] Product not found | id={}", itemReq.getProductId());
                continue;
            }
            var product = productOpt.get();

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = new OrderItem();
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

        Order saved = orderPort.save(order);
        log.info("[createOrder] SUCCESS | id={} | total={}", saved.getId(), total);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getAllOrders() {
        return orderPort.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getOrdersByUser(String userEmail) {
        return orderPort.findByUserEmail(userEmail).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse updateOrderStatus(Long id, String status, String updatedBy) {
        Order order = orderPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

        // Validate status value
        if (!List.of("PENDING", "COMPLETED", "CANCELLED").contains(status.toUpperCase())) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        order.setStatus(status.toUpperCase());
        order.setUpdatedAt(LocalDateTime.now());
        Order saved = orderPort.save(order);

        log.info("[updateOrderStatus] id={} | status={} | by={}", id, status, updatedBy);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public OrderResponse getOrderById(Long id) {
        return orderPort.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));

    }

    @Override
    public OrderResponse cancelOrder(Long id, String userEmail) {

        Order order = orderPort.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("You cannot cancel another user's order.");
        }

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Only pending orders can be cancelled.");
        }

        order.setStatus("CANCELLED");
        order.setUpdatedAt(LocalDateTime.now());

        return toResponse(orderPort.save(order));
    }

    @Override
    public void deleteOwnOrder(Long id, String userEmail) {

        Order order = orderPort.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!order.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Access denied");
        }

        if (!"CANCELLED".equals(order.getStatus())) {
            throw new RuntimeException(
                    "Only cancelled orders can be deleted."
            );
        }

        orderPort.deleteById(id);
    }

    @Override
    public void deleteOrder(Long id) {

        orderPort.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        orderPort.deleteById(id);
    }

    @Transactional(readOnly = true)
    @Override
    public List<OrderResponse> getOrdersByStatus(
            String status) {

        return orderPort.findAll()
                .stream()
                .filter(o ->
                        o.getStatus().equalsIgnoreCase(status))
                .map(this::toResponse)
                .toList();
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

        List<OrderItem> items =
                order.getItems() == null
                        ? Collections.emptyList()
                        : new ArrayList<>(order.getItems());

        List<OrderResponse.OrderItemResponse> itemResponses =

                items.stream()

                        .map(item ->

                                OrderResponse.OrderItemResponse.builder()

                                        .id(String.valueOf(item.getId()))

                                        .productId(String.valueOf(item.getProductId()))

                                        .productName(item.getProductName())

                                        .quantity(item.getQuantity())

                                        .price(item.getPrice())

                                        .subtotal(item.getSubtotal())

                                        .build()

                        )

                        .toList();

        return OrderResponse.builder()

                .id(String.valueOf(order.getId()))

                .userId(order.getUserEmail())

                .userName(order.getUserName())

                .items(itemResponses)

                .totalAmount(order.getTotalAmount())

                .status(order.getStatus())

                .createdAt(order.getCreatedAt())

                .updatedAt(order.getUpdatedAt())

                .build();

    }

}
