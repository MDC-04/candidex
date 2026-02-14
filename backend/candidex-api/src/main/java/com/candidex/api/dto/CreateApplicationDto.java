package com.candidex.api.dto;

import com.candidex.api.model.ApplicationLinks;
import com.candidex.api.model.NextAction;
import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new application
 * Based on API.md section 2.1
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateApplicationDto {
    
    @NotBlank(message = "Company name is required")
    @Size(min = 1, max = 120)
    private String companyName;
    
    @NotBlank(message = "Role title is required")
    @Size(min = 1, max = 120)
    private String roleTitle;
    
    @Size(max = 120)
    private String location;
    
    @NotNull(message = "Source is required")
    private ApplicationSource source;
    
    private ApplicationStatus status; // Default APPLIED if not provided
    
    private String appliedDate;
    
    @Min(0)
    private Integer salary;
    
    private String currency;
    
    @Size(max = 10)
    private List<String> tags;
    
    private ApplicationLinks links;
    
    @Size(max = 5000)
    private String notes;
    
    private NextAction nextAction;
}
