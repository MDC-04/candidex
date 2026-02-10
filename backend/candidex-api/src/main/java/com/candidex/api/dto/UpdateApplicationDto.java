package com.candidex.api.dto;

import com.candidex.api.model.ApplicationLinks;
import com.candidex.api.model.NextAction;
import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating an existing application (partial update)
 * Based on API.md section 2.4
 * All fields are optional
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationDto {
    
    @Size(min = 1, max = 120)
    private String companyName;
    
    @Size(min = 1, max = 120)
    private String roleTitle;
    
    @Size(max = 120)
    private String location;
    
    private ApplicationSource source;
    
    private ApplicationStatus status;
    
    private String appliedDate;
    
    @Min(0)
    private Integer salaryMin;
    
    @Min(0)
    private Integer salaryMax;
    
    private String currency;
    
    @Size(max = 10)
    private List<String> tags;
    
    private ApplicationLinks links;
    
    @Size(max = 5000)
    private String notes;
    
    private NextAction nextAction;
}
