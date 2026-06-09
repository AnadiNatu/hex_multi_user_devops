package com.example.MultiUserSecurityDemo.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "products")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false , length = 200)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false , precision = 10 , scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity" , nullable = false)
    private Integer stockQuantity;

    @Column(length = 100)
    private String category;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active" , nullable = false)
    private Boolean isActive;

    @Column(name = "created_at" , nullable = false , updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "owner_type" , nullable = false)
    private String ownerType;

    @Column(name = "created_by" , length = 255)
    private String createdBy;

    @Column(name = "updated_by" , length = 255)
    private String updatedBy;

    @PrePersist
    protected void onCreate(){
        createdAt = LocalDateTime.now();
        if (isActive == null){
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = LocalDateTime.now();
    }
}
