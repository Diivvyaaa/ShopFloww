package com.shopflow.service;

import com.shopflow.model.Order;
import com.shopflow.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateStatus(Long id, String status) { // ✅ was String
        Optional<Order> optional = orderRepository.findById(id); // ✅ was String
        if (optional.isPresent()) {
            Order order = optional.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found: " + id);
    }

    public Order save(Order order) {
        return orderRepository.save(order);
    }
}