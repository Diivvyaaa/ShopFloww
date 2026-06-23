package com.shopflow.repository;

import com.shopflow.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCustomerId(String customerId);

    @Transactional
    void deleteByCustomerId(String customerId);
}
