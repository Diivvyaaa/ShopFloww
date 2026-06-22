package com.shopflow.controller;

import com.shopflow.model.Product;
import com.shopflow.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository products;

    public ProductController(ProductRepository p) { products = p; }

    @GetMapping
    public List<Product> all() { return products.findAll(); }

    @PutMapping("/admin/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateStock(@PathVariable Long id, // ✅ was String
                                         @RequestBody Map<String, Integer> body) {
        return products.findById(id).map(p -> {
            p.setStock(body.get("stock"));
            return ResponseEntity.ok(products.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        return ResponseEntity.ok(products.save(product));
    }
}