package com.candidex.api.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user profile
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileDto {
    
    @Size(min = 1, max = 100)
    private String fullName;
    
    @Size(max = 100)
    private String currentPosition;
    
    @Size(max = 100)
    private String company;
    
    @Size(max = 100)
    private String location;
    
    @Size(max = 20)
    private String phone;
    
    @Size(max = 500)
    private String bio;
    
    @Size(max = 200)
    private String linkedinUrl;
    
    @Size(max = 200)
    private String portfolioUrl;
}
