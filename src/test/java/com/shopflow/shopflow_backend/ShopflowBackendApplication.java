package com.shopflow.shopflow_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@ComponentScan(basePackages = "com.shopflow")
@EnableMongoRepositories(basePackages = "com.shopflow.repository")
@EnableMethodSecurity   // needed for @PreAuthorize to work
public class ShopflowBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopflowBackendApplication.class, args);
    }
}

