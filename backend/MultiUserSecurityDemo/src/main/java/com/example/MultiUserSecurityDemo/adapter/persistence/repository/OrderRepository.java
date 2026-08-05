package com.example.MultiUserSecurityDemo.adapter.persistence.repository;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.OrderEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "items")
    List<OrderEntity> findByStatusOrderByCreatedAtDesc(String status);

    @Override
    @EntityGraph(attributePaths = "items")
    Optional<OrderEntity> findById(Long id);

}
