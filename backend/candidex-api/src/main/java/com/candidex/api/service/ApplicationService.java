package com.candidex.api.service;

import com.candidex.api.dto.CreateApplicationDto;
import com.candidex.api.dto.UpdateApplicationDto;
import com.candidex.api.model.Application;
import com.candidex.api.model.enums.ApplicationStatus;
import com.candidex.api.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service for managing job applications
 * Based on API.md section 2
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    
    /**
     * Get all applications for a user (paginated)
     */
    public Page<Application> getAllApplications(String userId, Pageable pageable) {
        log.debug("Fetching applications for user: {}", userId);
        return applicationRepository.findByUserId(userId, pageable);
    }
    
    /**
     * Get application by ID (with ownership check)
     */
    public Application getApplicationById(String id, String userId) {
        log.debug("Fetching application {} for user {}", id, userId);
        return applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));
    }
    
    /**
     * Create a new application
     */
    @Transactional
    public Application createApplication(CreateApplicationDto dto, String userId) {
        log.info("Creating application for user: {}", userId);
        
        // Build application
        Application application = Application.builder()
                .userId(userId)
                .companyName(dto.getCompanyName())
                .roleTitle(dto.getRoleTitle())
                .location(dto.getLocation())
                .source(dto.getSource())
                .status(dto.getStatus() != null ? dto.getStatus() : ApplicationStatus.APPLIED) // Default status
                .appliedDate(dto.getAppliedDate())
                .salary(dto.getSalary())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EUR") // Default currency
                .tags(dto.getTags())
                .links(dto.getLinks())
                .notes(dto.getNotes())
                .nextAction(dto.getNextAction())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        
        return applicationRepository.save(application);
    }
    
    /**
     * Update an existing application (partial update)
     */
    @Transactional
    public Application updateApplication(String id, UpdateApplicationDto dto, String userId) {
        log.info("Updating application {} for user {}", id, userId);
        
        Application application = getApplicationById(id, userId);
        
        // Apply updates (only non-null fields)
        if (dto.getCompanyName() != null) application.setCompanyName(dto.getCompanyName());
        if (dto.getRoleTitle() != null) application.setRoleTitle(dto.getRoleTitle());
        if (dto.getLocation() != null) application.setLocation(dto.getLocation());
        if (dto.getSource() != null) application.setSource(dto.getSource());
        if (dto.getStatus() != null) application.setStatus(dto.getStatus());
        if (dto.getAppliedDate() != null) application.setAppliedDate(dto.getAppliedDate());
        if (dto.getSalary() != null) application.setSalary(dto.getSalary());
        if (dto.getCurrency() != null) application.setCurrency(dto.getCurrency());
        if (dto.getTags() != null) application.setTags(dto.getTags());
        if (dto.getLinks() != null) application.setLinks(dto.getLinks());
        if (dto.getNotes() != null) application.setNotes(dto.getNotes());
        if (dto.getNextAction() != null) application.setNextAction(dto.getNextAction());
        
        application.setUpdatedAt(Instant.now());
        
        return applicationRepository.save(application);
    }
    
    /**
     * Delete an application (with ownership check)
     */
    @Transactional
    public void deleteApplication(String id, String userId) {
        log.info("Deleting application {} for user {}", id, userId);
        
        // Verify ownership first
        Application application = getApplicationById(id, userId);
        
        applicationRepository.delete(application);
    }
    
    /**
     * Count applications by user
     */
    public long countApplicationsByUser(String userId) {
        return applicationRepository.countByUserId(userId);
    }
    
    /**
     * Count applications by status for a user
     */
    public long countApplicationsByUserAndStatus(String userId, ApplicationStatus status) {
        return applicationRepository.countByUserIdAndStatus(userId, status);
    }
}
