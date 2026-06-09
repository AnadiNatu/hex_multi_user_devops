package com.example.MultiUserSecurityDemo.adapter.persistence.mapper;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.ProductEntity;
import com.example.MultiUserSecurityDemo.adapter.web.dto.product.ProductResponse;
import com.example.MultiUserSecurityDemo.domain.model.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toDomain(ProductEntity entity){
        if (entity == null) return null;

        Product domain = new Product();
        domain.setId(entity.getId());
        domain.setName(entity.getName());
        domain.setPrice(entity.getPrice());
        domain.setDescription(entity.getDescription());
        domain.setStockQuantity(entity.getStockQuantity());
        domain.setCategory(entity.getCategory());
        domain.setImageUrl(entity.getImageUrl());
        domain.setIsActive(entity.getIsActive());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        domain.setCreatedBy(entity.getCreatedBy());
        domain.setUpdatedBy(entity.getUpdatedBy());

        return domain;
    }

    public ProductEntity toEntity(Product entity , String ownerType){
        if (entity == null) return null;

        ProductEntity domain = new ProductEntity();
        domain.setId(entity.getId());
        domain.setName(entity.getName());
        domain.setPrice(entity.getPrice());
        domain.setDescription(entity.getDescription());
        domain.setStockQuantity(entity.getStockQuantity());
        domain.setCategory(entity.getCategory());
        domain.setImageUrl(entity.getImageUrl());
        domain.setIsActive(entity.getIsActive());
        domain.setCreatedAt(entity.getCreatedAt());
        domain.setUpdatedAt(entity.getUpdatedAt());
        domain.setCreatedBy(entity.getCreatedBy());
        domain.setUpdatedBy(entity.getUpdatedBy());

        domain.setOwnerType(ownerType != null ? ownerType : "ADMIN");

        return domain;
    }

    public ProductEntity toEntity(Product domain){
        return toEntity(domain, "ADMIN");
    }

    public ProductResponse mapToResponse(Product product){
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .createdBy(product.getCreatedBy())
                .updatedBy(product.getUpdatedBy())
                .build();
    }
}
