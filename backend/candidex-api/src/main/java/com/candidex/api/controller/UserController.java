package com.candidex.api.controller;

import com.candidex.api.dto.UpdateProfileDto;
import com.candidex.api.dto.UserProfileDto;
import com.candidex.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user profile management
 */
@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * Get current user profile
     * GET /api/v1/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update current user profile
     * PUT /api/v1/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileDto dto,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(profile);
    }
}
