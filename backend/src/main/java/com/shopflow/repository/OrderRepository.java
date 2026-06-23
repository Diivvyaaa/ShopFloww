package com.shopflow.repository;

import com.shopflow.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find all orders for a specific customer (used in GET /api/orders/my)
    List<Order> findByCustomerIdOrderByIdDesc(String customerId);

    // Find orders by status (used in admin filtering)
    List<Order> findByStatus(String status);
}
