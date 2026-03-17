package com.candidex.api.service;

import com.candidex.api.dto.CreateApplicationDto;
import com.candidex.api.dto.UpdateApplicationDto;
import com.candidex.api.model.Application;
import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import com.candidex.api.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service for managing job applications
 * Based on API.md section 2
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    private final MongoTemplate mongoTemplate;
    
    /**
     * Get all applications for a user (paginated)
     */
    public Page<Application> getAllApplications(String userId, Pageable pageable) {
        return getAllApplications(userId, null, null, null, null, pageable);
    }

    /**
     * Get all applications for a user with optional server-side filters.
     */
    public Page<Application> getAllApplications(
            String userId,
            ApplicationStatus status,
            ApplicationSource source,
            String q,
            String location,
            Pageable pageable
    ) {
        log.debug(
                "Fetching applications for user: {} with filters [status={}, source={}, q={}, location={}]",
                userId,
                status,
                source,
                q,
                location
        );

        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        if (source != null) {
            query.addCriteria(Criteria.where("source").is(source));
        }

        if (StringUtils.hasText(q)) {
            String safeQuery = Pattern.quote(q.trim());
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("companyName").regex(safeQuery, "i"),
                    Criteria.where("roleTitle").regex(safeQuery, "i"),
                    Criteria.where("notes").regex(safeQuery, "i")
            ));
        }

        if (StringUtils.hasText(location)) {
            String safeLocation = Pattern.quote(location.trim());
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("city").regex(safeLocation, "i"),
                    Criteria.where("country").regex(safeLocation, "i")
            ));
        }

        long total = mongoTemplate.count(query, Application.class);
        query.with(pageable);
        List<Application> items = mongoTemplate.find(query, Application.class);

        return new PageImpl<>(items, pageable, total);
    }
    
    /**
     * Get application by ID (with ownership check)
     */
    public Application getApplicationById(String id, String userId) {
        log.debug("Fetching application {} for user {}", id, userId);
        return applicationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature introuvable."));
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
                .city(dto.getCity())
                .country(dto.getCountry())
                .source(dto.getSource())
                .status(dto.getStatus() != null ? dto.getStatus() : ApplicationStatus.APPLIED) // Default status
                .employmentType(dto.getEmploymentType())
                .appliedDate(dto.getAppliedDate())
                .salary(dto.getSalary())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "EUR") // Default currency
                .salaryPeriod(dto.getSalaryPeriod())
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
        if (dto.getCity() != null) application.setCity(dto.getCity());
        if (dto.getCountry() != null) application.setCountry(dto.getCountry());
        if (dto.getSource() != null) application.setSource(dto.getSource());
        if (dto.getStatus() != null) application.setStatus(dto.getStatus());
        if (dto.getEmploymentType() != null) application.setEmploymentType(dto.getEmploymentType());
        if (dto.getAppliedDate() != null) application.setAppliedDate(dto.getAppliedDate());
        if (dto.getSalary() != null) application.setSalary(dto.getSalary());
        if (dto.getCurrency() != null) application.setCurrency(dto.getCurrency());
        if (dto.getSalaryPeriod() != null) application.setSalaryPeriod(dto.getSalaryPeriod());
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
