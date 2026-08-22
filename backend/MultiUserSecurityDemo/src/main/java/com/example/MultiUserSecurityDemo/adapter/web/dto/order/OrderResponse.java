package com.example.MultiUserSecurityDemo.adapter.web.dto.order;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse implements Serializable {
    private static final long serialVersionUID = 1L;
    private String              id;           // String to match frontend (Long → String)
    private String              userId;       // userEmail (used as userId on frontend)
    private String              userName;
    private List<OrderItemResponse> items;
    private BigDecimal totalAmount;
    private String status;       // PENDING | COMPLETED | CANCELLED

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private String updatedAt;

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
