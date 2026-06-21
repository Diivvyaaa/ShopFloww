package com.shopflow.controller;

import com.shopflow.model.User;
import com.shopflow.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository        users;

    public AuthController(AuthenticationManager authManager, UserRepository users) {
        this.authManager = authManager;
        this.users       = users;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // 1. Authenticate
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.get("email"), body.get("password"))
            );

            // 2. Store in SecurityContext
            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);

            // 3. Save context into the HTTP session explicitly
            HttpSession session = request.getSession(true);
            session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx
            );

            System.out.println("LOGIN OK: " + body.get("email") + " sessionId=" + session.getId());

            User user = users.findByEmail(body.get("email")).orElseThrow();
            return ResponseEntity.ok(toMap(user));

        } catch (Exception e) {
            System.out.println("LOGIN FAILED: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        }
        return users.findByEmail(auth.getName())
                .map(u -> ResponseEntity.ok(toMap(u)))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    private Map<String, Object> toMap(User u) {
        return Map.of(
            "id",         u.getId(),
            "name",       u.getName()       != null ? u.getName()       : "",
            "email",      u.getEmail()      != null ? u.getEmail()      : "",
            "role",       u.getRole()       != null ? u.getRole()       : "customer",
            "customerId", u.getCustomerId() != null ? u.getCustomerId() : ""
        );
    }
}