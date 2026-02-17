package com.candidex.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDto {
    
    private String id;
    private String email;
    private String fullName;
    private String currentPosition;
    private String company;
    private String location;
    private String phone;
    private String bio;
    private String linkedinUrl;
    private String portfolioUrl;
    private String cvFilename;
    private String cvOriginalFilename;
    private String createdAt;
    private String updatedAt;
}
