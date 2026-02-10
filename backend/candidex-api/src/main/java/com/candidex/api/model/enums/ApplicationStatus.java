package com.candidex.api.model.enums;

/**
 * Possible statuses for a job application
 * Based on DOMAIN.md section 3.1
 */
public enum ApplicationStatus {
    APPLIED,
    HR_INTERVIEW,
    TECH_INTERVIEW,
    OFFER,
    REJECTED,
    GHOSTED
}
