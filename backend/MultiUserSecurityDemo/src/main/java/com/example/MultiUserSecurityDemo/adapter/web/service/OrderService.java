package com.example.MultiUserSecurityDemo.adapter.web.service;

import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderRequest;
import com.example.MultiUserSecurityDemo.adapter.web.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request , String userEmail , String userName);
    List<OrderResponse> getAllOrders();
    List<OrderResponse> getOrdersByUser(String userEmail);
    OrderResponse updateOrderStatus(Long id , String status , String updatedBy);
    OrderResponse getOrderById(Long id);
}
