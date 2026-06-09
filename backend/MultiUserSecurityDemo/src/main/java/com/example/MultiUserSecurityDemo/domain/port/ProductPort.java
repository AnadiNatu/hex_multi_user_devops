package com.example.MultiUserSecurityDemo.domain.port;

import com.example.MultiUserSecurityDemo.domain.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductPort {
    Product save(Product product);
    Optional<Product> findById(Long id);
    List<Product> findAll();
    List<Product> findByCategory(String category);
    List<Product> findByIsActive(Boolean isActive);
    void deleteById(Long id);
    boolean existsById(Long id);
}
