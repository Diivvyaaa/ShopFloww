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

    // GET /api/cart — get current customer's cart
    @GetMapping
    public ResponseEntity<?> getCart(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(cart.findByCustomerId(user.getCustomerId()));
    }

    // POST /api/cart — add item { productId, quantity }
    @PostMapping
    public ResponseEntity<?> addItem(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = getUser(auth);
        String productId = body.get("productId").toString();
        int  quantity  = Integer.parseInt(body.get("quantity").toString());

        Product product = products.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();

        // Check if already in cart — if so, update qty
        List<CartItem> existing = cart.findByCustomerId(user.getCustomerId());
        for (CartItem item : existing) {
            if (item.getProductId().equals(productId)) {
                item.setQuantity(item.getQuantity() + quantity);
                return ResponseEntity.ok(cart.save(item));
            }
        }

        CartItem item = new CartItem();
        item.setCustomerId(user.getCustomerId());
        item.setProductId(productId);
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setQuantity(quantity);
        return ResponseEntity.ok(cart.save(item));
    }

    // PUT /api/cart/{id} — update quantity { quantity }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        return cart.findById(id).map(item -> {
            item.setQuantity(body.get("quantity"));
            return ResponseEntity.ok(cart.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/cart/{id} — remove one item
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeItem(@PathVariable String id) {
        cart.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/cart/clear — clear entire cart after order placed
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication auth) {
        User user = getUser(auth);
        cart.deleteByCustomerId(user.getCustomerId());
        return ResponseEntity.ok().build();
    }
}
