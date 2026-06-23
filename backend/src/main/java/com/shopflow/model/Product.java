package com.shopflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String  name;
    private String  category;
    private Double  price;
    private Integer stock;
    private String  emoji;

    @Column(length = 1000)
    private String  description;

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public Long getId()                     { return id; }
    public void setId(Long id)              { this.id = id; }

    public String getName()                 { return name; }
    public void setName(String name)        { this.name = name; }

    public String getCategory()                 { return category; }
    public void setCategory(String category)    { this.category = category; }

    public Double getPrice()                { return price; }
    public void setPrice(Double price)      { this.price = price; }

    public Integer getStock()               { return stock; }
    public void setStock(Integer stock)     { this.stock = stock; }

    public String getEmoji()                { return emoji; }
    public void setEmoji(String emoji)      { this.emoji = emoji; }

    public String getDescription()                  { return description; }
    public void setDescription(String description)  { this.description = description; }
}