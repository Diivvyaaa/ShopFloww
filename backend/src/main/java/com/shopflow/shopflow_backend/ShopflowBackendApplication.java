package com.shopflow.shopflow_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.shopflow")
@EnableJpaRepositories(basePackages = "com.shopflow.repository")
@EntityScan(basePackages = "com.shopflow.model")
public class ShopflowBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopflowBackendApplication.class, args);
    }
}
