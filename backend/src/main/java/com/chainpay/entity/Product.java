package com.chainpay.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "price_eth", nullable = false)
    private String priceEth;

    @Column(name = "price_wei", nullable = true)
    private String priceWei;

    @Column(name = "image_url")
    private String imageUrl;

    // Constructors
    public Product() {}

    public Product(String name, String description, String priceEth, String priceWei, String imageUrl) {
        this.name = name;
        this.description = description;
        this.priceEth = priceEth;
        this.priceWei = priceWei;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters (Bạn có thể dùng @Data của Lombok nếu dự án có cài Lombok)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriceEth() { return priceEth; }
    public void setPriceEth(String priceEth) { this.priceEth = priceEth; }

    public String getPriceWei() { return priceWei; }
    public void setPriceWei(String priceWei) { this.priceWei = priceWei; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Thêm một Helper Method (Tùy chọn) để tự động tính Wei nếu FE không gửi
    public void calculateWeiFromEth() {
        try {
            if (this.priceEth != null && (this.priceWei == null || this.priceWei.isEmpty())) {
                double eth = Double.parseDouble(this.priceEth);
                this.priceWei = String.format("%.0f", eth * 1e18);
            }
        } catch (Exception e) {
            this.priceWei = "0";
        }
    }
}