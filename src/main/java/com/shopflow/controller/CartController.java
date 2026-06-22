package com.shopflow.controller;

import com.shopflow.model.CartItem;
import com.shopflow.model.Product;
import com.shopflow.model.User;
import com.shopflow.repository.CartRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository    cart;
    private final ProductRepository products;
    private final UserRepository    users;

    public CartController(CartRepository cart, ProductRepository products, UserRepository users) {
        this.cart     = cart;
        this.products = products;
        this.users    = users;
    }

    private User getUser(Authentication auth) {
        return users.findByEmail(auth.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<?> getCart(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(cart.findByCustomerId(user.getCustomerId()));
    }

    @PostMapping
    public ResponseEntity<?> addItem(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getUser(auth);
        Long productId = Long.parseLong(body.get("productId").toString()); // ✅ was String
        int  quantity  = Integer.parseInt(body.get("quantity").toString());

        Product product = products.findById(productId).orElse(null); // ✅ now Long
        if (product == null) return ResponseEntity.notFound().build();

        List<CartItem> existing = cart.findByCustomerId(user.getCustomerId());
        for (CartItem item : existing) {
            if (item.getProductId().equals(productId.toString())) {
                item.setQuantity(item.getQuantity() + quantity);
                return ResponseEntity.ok(cart.save(item));
            }
        }

        CartItem item = new CartItem();
        item.setCustomerId(user.getCustomerId());
        item.setProductId(productId.toString());
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setQuantity(quantity);
        return ResponseEntity.ok(cart.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, // ✅ was String
                                        @RequestBody Map<String, Integer> body) {
        return cart.findById(id).map(item -> {
            item.setQuantity(body.get("quantity"));
            return ResponseEntity.ok(cart.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeItem(@PathVariable Long id) { // ✅ was String
        cart.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication auth) {
        User user = getUser(auth);
        cart.deleteByCustomerId(user.getCustomerId());
        return ResponseEntity.ok().build();
    }
}