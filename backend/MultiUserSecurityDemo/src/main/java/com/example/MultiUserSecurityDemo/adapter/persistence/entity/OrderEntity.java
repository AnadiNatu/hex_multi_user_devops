package com.example.MultiUserSecurityDemo.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class OrderEntity {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(name = "User_email" , nullable = false)
    private String userEmail;

    @Column(name = "user_name" , length = 255)
    private String userName;

    @Column(name = "total_amount" , nullable = false , precision = 12 , scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false , length = 20)
    private String status;

    @Column(name = "created_at" , nullable = false , updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order" , cascade = CascadeType.ALL ,
    orphanRemoval = true , fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
