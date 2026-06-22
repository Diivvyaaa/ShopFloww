package com.shopflow.shopflow_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@ComponentScan(basePackages = "com.shopflow")
@EnableMethodSecurity   // needed for @PreAuthorize to work
public class ShopflowBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopflowBackendApplication.class, args);
    }
}

