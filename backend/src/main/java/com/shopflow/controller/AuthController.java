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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository        users;
    private final PasswordEncoder       encoder;

    public AuthController(AuthenticationManager authManager,
                          UserRepository users,
                          PasswordEncoder encoder) {
        this.authManager = authManager;
        this.users       = users;
        this.encoder     = encoder;
    }

    // ── REGISTER ──────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String name     = body.get("name");

        if (email == null || password == null || name == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email and password are required"));

        if (users.findByEmail(email).isPresent())
            return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));

        String customerId = "C" + String.format("%03d", (users.count() + 1));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole("customer");
        user.setCustomerId(customerId);

        User saved = users.save(user);
        System.out.println("REGISTERED: " + email + " customerId=" + customerId);
        return ResponseEntity.ok(toMap(saved));
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.get("email"), body.get("password"))
            );

            SecurityContext ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication(auth);
            SecurityContextHolder.setContext(ctx);

            HttpSession oldSession = request.getSession(false);
            if (oldSession != null) oldSession.invalidate();

            HttpSession session = request.getSession(true);
            session.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, ctx
            );

            // ✅ SameSite=None; Secure — required for cross-domain cookies
            response.setHeader("Set-Cookie",
                "JSESSIONID=" + session.getId() +
                "; Path=/; HttpOnly; SameSite=None; Secure"
            );

            System.out.println("LOGIN OK: " + body.get("email") + " sessionId=" + session.getId());

            User user = users.findByEmail(body.get("email")).orElseThrow();
            return ResponseEntity.ok(toMap(user));

        } catch (Exception e) {
            System.out.println("LOGIN FAILED: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }
    }

    // ── ME ────────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(Map.of("error", "Not logged in"));
        return users.findByEmail(auth.getName())
                .map(u -> ResponseEntity.ok(toMap(u)))
                .orElse(ResponseEntity.status(401).build());
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────────
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