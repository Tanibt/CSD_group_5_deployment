package com.genbridge.backend.controller;

import com.genbridge.backend.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("currentStreak", user.getCurrentStreak());
        profile.put("lastActiveDate", user.getLastActiveDate());

        return ResponseEntity.ok(profile);
    }
}
