package com.candidex.api.controller;

import com.candidex.api.dto.AuthResponse;
import com.candidex.api.dto.LoginDto;
import com.candidex.api.dto.RegisterDto;
import com.candidex.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints
 * Based on API.md section 1
 */
@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Register a new user
     * POST /api/v1/auth/register
     * 
     * @param dto Registration data
     * @return 201 Created with user and access token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterDto dto) {
        AuthResponse response = authService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Login user
     * POST /api/v1/auth/login
     * 
     * @param dto Login credentials
     * @return 200 OK with user and access token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginDto dto) {
        AuthResponse response = authService.login(dto);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current authenticated user
     * GET /api/v1/me
     * 
     * @param authentication Spring Security authentication (injected)
     * @return 200 OK with user info
     */
    @GetMapping("/api/v1/me")
    public ResponseEntity<AuthResponse.UserDto> getCurrentUser(Authentication authentication) {
        String userId = authentication.getName(); // userId is stored as principal
        AuthResponse.UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(user);
    }
}
