package com.shopflow.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String    product;
    private Double    total;
    private String    status = "Pending";
    private LocalDate date   = LocalDate.now();
    private String    customerName;
    private String    customerId;

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }

    public String getProduct()              { return product; }
    public void setProduct(String product)  { this.product = product; }

    public Double getTotal()                { return total; }
    public void setTotal(Double total)      { this.total = total; }

    public String getStatus()               { return status; }
    public void setStatus(String status)    { this.status = status; }

    public LocalDate getDate()              { return date; }
    public void setDate(LocalDate date)     { this.date = date; }

    public String getCustomerName()                     { return customerName; }
    public void setCustomerName(String customerName)    { this.customerName = customerName; }

    public String getCustomerId()                   { return customerId; }
    public void setCustomerId(String customerId)    { this.customerId = customerId; }
}