package com.example.MultiUserSecurityDemo.adapter.persistence.mapper;

import com.example.MultiUserSecurityDemo.adapter.persistence.entity.OrderEntity;
import com.example.MultiUserSecurityDemo.adapter.persistence.entity.OrderItemEntity;
import com.example.MultiUserSecurityDemo.domain.model.Order;
import com.example.MultiUserSecurityDemo.domain.model.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public Order toDomain(OrderEntity entity) {
        if (entity == null) return null;

        Order order = new Order();
        order.setId(entity.getId());
        order.setUserEmail(entity.getUserEmail());
        order.setUserName(entity.getUserName());
        order.setTotalAmount(entity.getTotalAmount());
        order.setStatus(entity.getStatus());
        order.setCreatedAt(entity.getCreatedAt());
        order.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getItems() != null) {
            order.setItems(entity.getItems().stream()
                    .map(this::itemToDomain)
                    .collect(Collectors.toList()));
        }
        return order;
    }

    public OrderItem itemToDomain(OrderItemEntity entity) {
        if (entity == null) return null;

        OrderItem item = new OrderItem();
        item.setId(entity.getId());
        item.setProductId(entity.getProductId());
        item.setProductName(entity.getProductName());
        item.setQuantity(entity.getQuantity());
        item.setPrice(entity.getPrice());
        item.setSubtotal(entity.getSubtotal());
        return item;
    }

    public OrderEntity toEntity(Order domain) {
        if (domain == null) return null;

        OrderEntity entity = new OrderEntity();
        entity.setId(domain.getId());
        entity.setUserEmail(domain.getUserEmail());
        entity.setUserName(domain.getUserName());
        entity.setTotalAmount(domain.getTotalAmount());
        entity.setStatus(domain.getStatus() != null ? domain.getStatus() : "PENDING");
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setUpdatedAt(domain.getUpdatedAt());

        if (domain.getItems() != null) {
            List<OrderItemEntity> itemEntities = domain.getItems().stream()
                    .map(item -> itemToEntity(item, entity))
                    .collect(Collectors.toList());
            entity.setItems(itemEntities);
        }
        return entity;
    }

    public OrderItemEntity itemToEntity(OrderItem item, OrderEntity parentOrder) {
        if (item == null) return null;

        OrderItemEntity entity = new OrderItemEntity();
        entity.setId(item.getId());
        entity.setOrder(parentOrder);
        entity.setProductId(item.getProductId());
        entity.setProductName(item.getProductName());
        entity.setQuantity(item.getQuantity());
        entity.setPrice(item.getPrice());
        entity.setSubtotal(item.getSubtotal());
        return entity;
    }
}