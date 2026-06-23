package com.shopflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
<<<<<<< HEAD
                registry.addMapping("/**")
                    .allowedOriginPatterns("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
=======
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173"
                       
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
>>>>>>> 84a6d64 (NEWDB)
                    .allowCredentials(true);
            }
        };
    }
}