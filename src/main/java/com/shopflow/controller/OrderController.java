package com.shopflow.controller;

import com.shopflow.model.Order;
import com.shopflow.model.User;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orders;
    private final UserRepository  users;

    public OrderController(OrderRepository orders, UserRepository users) {
        this.orders = orders;
        this.users  = users;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("ERR placeOrder: not authenticated");
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            System.out.println("OK  placeOrder by: " + auth.getName() + " body=" + body);

            User user = users.findByEmail(auth.getName()).orElse(null);
            if (user == null) return ResponseEntity.status(401).body(Map.of("error","User not found"));
            if (body.get("product") == null || body.get("total") == null)
                return ResponseEntity.badRequest().body(Map.of("error","Missing fields"));

            Order order = new Order();
            order.setProduct(body.get("product").toString());
            order.setTotal(Double.parseDouble(body.get("total").toString()));
            order.setStatus("Pending");
            order.setCustomerName(user.getName() != null ? user.getName() : user.getEmail());
            order.setCustomerId(user.getCustomerId() != null ? user.getCustomerId() : user.getEmail());

            Order saved = orders.save(order);
            System.out.println("SAVED order id=" + saved.getId() + " for " + saved.getCustomerName());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("EXCEPTION placeOrder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> myOrders(Authentication auth) {
        try {
            if (auth == null) return ResponseEntity.status(401).body("Not authenticated");
            User user = users.findByEmail(auth.getName()).orElse(null);
            if (user == null) return ResponseEntity.status(401).body("User not found");
            String cid = user.getCustomerId();
            List<Order> myOrders = (cid != null && !cid.isEmpty())
                ? orders.findByCustomerIdOrderByIdDesc(cid)
                : orders.findByCustomerIdOrderByIdDesc(user.getEmail());
            return ResponseEntity.ok(myOrders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> allOrders() {
        try {
            List<Order> all = orders.findAll();
            all.sort((a, b) -> b.getId().compareTo(a.getId()));
            return ResponseEntity.ok(all);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return orders.findById(id).map(order -> {
            order.setStatus(body.get("status"));
            return ResponseEntity.ok(orders.save(order));
        }).orElse(ResponseEntity.notFound().build());
    }
}