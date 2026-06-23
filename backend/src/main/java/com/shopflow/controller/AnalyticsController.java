package com.shopflow.controller;

import com.shopflow.model.Order;
import com.shopflow.repository.OrderRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final OrderRepository orderRepository;

    // Constructor injection (replaces @RequiredArgsConstructor)
    public AnalyticsController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        List<Order> orders = orderRepository.findAll();
        double revenue = orders.stream().mapToDouble(Order::getTotal).sum();
        long customers = orders.stream().map(Order::getCustomerName).distinct().count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenue", revenue);
        stats.put("orders", orders.size());
        stats.put("customers", customers);
        stats.put("conversion", 3.6);
        return stats;
    }

    @GetMapping("/revenue-chart")
    public List<Map<String, Object>> getRevenueChart() {
        return List.of(
            Map.of("month", "Sep", "revenue", 42000, "orders", 820),
            Map.of("month", "Oct", "revenue", 55000, "orders", 940),
            Map.of("month", "Nov", "revenue", 61000, "orders", 1100),
            Map.of("month", "Dec", "revenue", 79000, "orders", 1380),
            Map.of("month", "Jan", "revenue", 68000, "orders", 1150),
            Map.of("month", "Feb", "revenue", 84320, "orders", 1243)
        );
    }
}
