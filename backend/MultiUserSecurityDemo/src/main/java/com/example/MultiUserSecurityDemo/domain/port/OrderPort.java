package com.example.MultiUserSecurityDemo.domain.port;

import com.example.MultiUserSecurityDemo.domain.model.Order;

import java.util.List;
import java.util.Optional;

public interface OrderPort {

    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
    List<Order> findByUserEmail(String userEmail);
    void deleteById(Long id);

}
