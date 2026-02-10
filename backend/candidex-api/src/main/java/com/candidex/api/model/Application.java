package com.candidex.api.model;

import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

/**
 * Application (job application) entity
 * Based on DOMAIN.md section 2.2
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "applications")
@CompoundIndex(name = "user_updated_idx", def = "{'userId': 1, 'updatedAt': -1}")
@CompoundIndex(name = "user_status_updated_idx", def = "{'userId': 1, 'status': 1, 'updatedAt': -1}")
public class Application {
    
    @Id
    private String id;
    
    @NotBlank(message = "User ID is required")
    @Indexed
    private String userId;
    
    @NotBlank(message = "Company name is required")
    @Size(min = 1, max = 120, message = "Company name must be between 1 and 120 characters")
    private String companyName;
    
    @NotBlank(message = "Role title is required")
    @Size(min = 1, max = 120, message = "Role title must be between 1 and 120 characters")
    private String roleTitle;
    
    @Size(max = 120, message = "Location must not exceed 120 characters")
    private String location;
    
    @NotNull(message = "Source is required")
    private ApplicationSource source;
    
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
    
    private String appliedDate; // ISO date (YYYY-MM-DD)
    
    @Min(value = 0, message = "Minimum salary must be positive")
    private Integer salaryMin;
    
    @Min(value = 0, message = "Maximum salary must be positive")
    private Integer salaryMax;
    
    @Builder.Default
    private String currency = "EUR";
    
    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<String> tags;
    
    private ApplicationLinks links;
    
    @Size(max = 5000, message = "Notes must not exceed 5000 characters")
    private String notes;
    
    private NextAction nextAction;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant updatedAt;
}
