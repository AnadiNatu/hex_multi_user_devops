package com.example.MultiUserSecurityDemo.adapter.persistence;

import com.example.MultiUserSecurityDemo.adapter.persistence.mapper.OrderMapper;
import com.example.MultiUserSecurityDemo.adapter.persistence.repository.OrderRepository;
import com.example.MultiUserSecurityDemo.domain.model.Order;
import com.example.MultiUserSecurityDemo.domain.port.OrderPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OrderPersistenceAdapter implements OrderPort {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public OrderPersistenceAdapter(OrderRepository repository , OrderMapper mapper){
        this.orderRepository = repository;
        this.orderMapper = mapper;
    }

    @Override
    public Order save(Order order) {
        var entity = orderMapper.toEntity(order);
        var savedEntity = orderRepository.save(entity);
        return orderMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Order> findById(Long id) {
        return orderRepository.findById(id).map(orderMapper::toDomain);
    }

    @Override
    public List<Order> findAll() {
        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> findByUserEmail(String userEmail) {
        return orderRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(orderMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        orderRepository.deleteById(id);
    }
}