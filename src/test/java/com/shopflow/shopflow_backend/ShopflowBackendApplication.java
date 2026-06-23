package com.shopflow.shopflow_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
<<<<<<< HEAD:src/test/java/com/shopflow/shopflow_backend/ShopflowBackendApplication.java
import org.springframework.context.annotation.ComponentScan;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@ComponentScan(basePackages = "com.shopflow")
@EnableMethodSecurity   // needed for @PreAuthorize to work
=======
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.shopflow")
@EnableJpaRepositories(basePackages = "com.shopflow.repository")
@EntityScan(basePackages = "com.shopflow.model")
>>>>>>> 84a6d64 (NEWDB):backend/src/main/java/com/shopflow/shopflow_backend/ShopflowBackendApplication.java
public class ShopflowBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopflowBackendApplication.class, args);
    }
<<<<<<< HEAD:src/test/java/com/shopflow/shopflow_backend/ShopflowBackendApplication.java
}

=======
}
>>>>>>> 84a6d64 (NEWDB):backend/src/main/java/com/shopflow/shopflow_backend/ShopflowBackendApplication.java
