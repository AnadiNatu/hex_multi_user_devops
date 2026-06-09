package com.example.MultiUserSecurityDemo.adapter.web.dto.order;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private String              id;           // String to match frontend (Long → String)
    private String              userId;       // userEmail (used as userId on frontend)
    private String              userName;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String              status;       // PENDING | COMPLETED | CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime       updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private String     id;
        private String     productId;
        private String     productName;
        private Integer    quantity;
        private BigDecimal price;
        private BigDecimal subtotal;
    }
}
