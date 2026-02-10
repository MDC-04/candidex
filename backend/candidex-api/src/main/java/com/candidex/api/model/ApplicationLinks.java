package com.candidex.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Optional links related to an application
 * Based on DOMAIN.md section 2.3
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationLinks {
    
    private String jobPostingUrl;
    private String companyWebsiteUrl;
    private String resumeUrl;
    private String coverLetterUrl;
}
