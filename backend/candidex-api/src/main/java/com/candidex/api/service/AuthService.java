package com.candidex.api.service;

import com.candidex.api.dto.AuthResponse;
import com.candidex.api.dto.LoginDto;
import com.candidex.api.dto.RegisterDto;
import com.candidex.api.model.User;
import com.candidex.api.repository.UserRepository;
import com.candidex.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service for authentication operations
 * Based on API.md section 1 and SECURITY.md
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * Register a new user
     * 
     * @param dto Registration data
     * @return Authentication response with user and token
     * @throws RuntimeException if email already exists
     */
    @Transactional
    public AuthResponse register(RegisterDto dto) {
        // Check if email already exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Create new user
        User user = User.builder()
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .fullName(dto.getFullName())
                .currentPosition(dto.getCurrentPosition())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .phone(dto.getPhone())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        // Save user
        user = userRepository.save(user);
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        // Build response
        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .build())
                .accessToken(token)
                .build();
    }
    
    /**
     * Login user
     * 
     * @param dto Login credentials
     * @return Authentication response with user and token
     * @throws RuntimeException if credentials are invalid
     */
    public AuthResponse login(LoginDto dto) {
        // Find user by email
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        // Check password
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        
        // Build response
        return AuthResponse.builder()
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .build())
                .accessToken(token)
                .build();
    }
    
    /**
     * Get current authenticated user info
     * 
     * @param userId Authenticated user ID from JWT
     * @return User info
     */
    public AuthResponse.UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return AuthResponse.UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }
}
