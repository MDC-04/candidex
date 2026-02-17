package com.candidex.api.service;

import com.candidex.api.dto.UpdateProfileDto;
import com.candidex.api.dto.UserProfileDto;
import com.candidex.api.model.User;
import com.candidex.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service for user profile management
 */
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    /**
     * Get user profile by ID
     */
    public UserProfileDto getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return mapToDto(user);
    }
    
    /**
     * Update user profile
     */
    public UserProfileDto updateProfile(String userId, UpdateProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update fields
        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getCurrentPosition() != null) {
            user.setCurrentPosition(dto.getCurrentPosition());
        }
        if (dto.getCompany() != null) {
            user.setCompany(dto.getCompany());
        }
        if (dto.getLocation() != null) {
            user.setLocation(dto.getLocation());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }
        if (dto.getLinkedinUrl() != null) {
            user.setLinkedinUrl(dto.getLinkedinUrl());
        }
        if (dto.getPortfolioUrl() != null) {
            user.setPortfolioUrl(dto.getPortfolioUrl());
        }
        
        User updated = userRepository.save(user);
        return mapToDto(updated);
    }
    
    /**
     * Map User entity to UserProfileDto
     */
    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .currentPosition(user.getCurrentPosition())
                .company(user.getCompany())
                .location(user.getLocation())
                .phone(user.getPhone())
                .bio(user.getBio())
                .linkedinUrl(user.getLinkedinUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .cvFilename(user.getCvFilename())
                .cvOriginalFilename(user.getCvOriginalFilename())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                .build();
    }
    
    /**
     * Update CV filename for user
     */
    public void updateCvFilename(String userId, String filename) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCvFilename(filename);
        userRepository.save(user);
    }
    
    /**
     * Update CV filenames (both stored and original)
     */
    public void updateCvFilenames(String userId, String filename, String originalFilename) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCvFilename(filename);
        user.setCvOriginalFilename(originalFilename);
        userRepository.save(user);
    }
    
    /**
     * Get CV filename for user
     */
    public String getCvFilename(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getCvFilename();
    }
    
    /**
     * Delete CV filename for user
     */
    public void deleteCvFilename(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCvFilename(null);
        user.setCvOriginalFilename(null);
        userRepository.save(user);
    }
}
