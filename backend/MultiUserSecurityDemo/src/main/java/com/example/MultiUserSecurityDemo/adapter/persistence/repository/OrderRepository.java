package com.example.MultiUserSecurityDemo.adapter.persistence.repository;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity , Long> {

    List<OrderEntity> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    List<OrderEntity> findAllByOrderByCreatedAtDesc();

    List<OrderEntity> findByStatusOrderByCreatedAtDesc(String status);
}
