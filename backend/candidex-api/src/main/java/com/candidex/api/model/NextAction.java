package com.candidex.api.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Next action/reminder for an application
 * Based on DOMAIN.md section 2.4
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NextAction {
    
    @NotBlank(message = "Next action date is required")
    private String date; // ISO date (YYYY-MM-DD)
    
    @Size(max = 300, message = "Note must not exceed 300 characters")
    private String note;
    
    @Builder.Default
    private Boolean done = false;
}
