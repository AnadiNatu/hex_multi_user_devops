package com.example.MultiUserSecurityDemo.adapter.persistence.repository;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity , Long> {

    List<ProductEntity> findByCategory(String category);
    List<ProductEntity> findByIsActive(Boolean isActive);
    List<ProductEntity> findByCategoryAndIsActive(String category , Boolean isActive);

}
