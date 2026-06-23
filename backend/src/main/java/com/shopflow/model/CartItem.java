package com.shopflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String  customerId;
    private String  productId;
    private String  productName;
    private Double  price;
    private Integer quantity;

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId()                         { return id; }
    public void setId(Long id)                 { this.id = id; }

    public String getCustomerId()                       { return customerId; }
    public void setCustomerId(String customerId)        { this.customerId = customerId; }

    public String getProductId()                    { return productId; }
    public void setProductId(String productId)      { this.productId = productId; }

    public String getProductName()                      { return productName; }
    public void setProductName(String productName)      { this.productName = productName; }

    public Double getPrice()                    { return price; }
    public void setPrice(Double price)          { this.price = price; }

    public Integer getQuantity()                    { return quantity; }
    public void setQuantity(Integer quantity)        { this.quantity = quantity; }
}


