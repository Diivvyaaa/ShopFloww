package com.shopflow.config;

import com.shopflow.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository users;

    public UserDetailsServiceImpl(UserRepository users) {
        this.users = users;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.shopflow.model.User u = users.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found: " + email));
        return User.withUsername(u.getEmail())
            .password(u.getPassword())
            .roles(u.getRole().toUpperCase())
            .build();
    }
}