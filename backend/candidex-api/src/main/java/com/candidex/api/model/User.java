package com.candidex.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

/**
 * User entity
 * Based on DOMAIN.md section 2.1
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Indexed(unique = true)
    private String email;
    
    @NotBlank(message = "Password hash is required")
    private String passwordHash; // Never exposed to client
    
    private String fullName;
    
    // Additional profile fields
    private String currentPosition; // Current job title
    private String company; // Current company
    private String location; // City, Country
    private String phone; // Phone number
    private String bio; // Short bio/description (max 500 chars)
    private String linkedinUrl; // LinkedIn profile URL
    private String portfolioUrl; // Personal website/portfolio
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}
