package com.candidex.api.dto;

import com.candidex.api.model.ApplicationLinks;
import com.candidex.api.model.NextAction;
import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import com.candidex.api.model.enums.EmploymentType;
import com.candidex.api.model.enums.SalaryPeriod;
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
    
    @Size(max = 255)
    private String companyDomain;
    
    @NotBlank(message = "Role title is required")
    @Size(min = 1, max = 120)
    private String roleTitle;
    
    @Size(max = 100)
    private String city;
    
    @Size(max = 100)
    private String country;
    
    @NotNull(message = "Source is required")
    private ApplicationSource source;
    
    private ApplicationStatus status; // Default APPLIED if not provided
    
    private EmploymentType employmentType;
    
    private String appliedDate;
    
    @Min(0)
    private Integer salary;
    
    private String currency;
    
    private SalaryPeriod salaryPeriod;
    
    @Size(max = 10)
    private List<String> tags;
    
    private ApplicationLinks links;
    
    @Size(max = 5000)
    private String notes;
    
    private NextAction nextAction;
}
