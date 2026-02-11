package com.candidex.api.controller;

import com.candidex.api.dto.CreateApplicationDto;
import com.candidex.api.dto.UpdateApplicationDto;
import com.candidex.api.model.Application;
import com.candidex.api.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for job applications
 * Based on API.md section 2
 * Base path: /api/v1/applications
 */
@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular frontend
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    /**
     * List applications (paginated)
     * GET /api/v1/applications?page=1&size=20&sort=updatedAt,desc
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listApplications(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "updatedAt,desc") String sort
    ) {
        String userId = authentication.getName();
        log.info("GET /api/v1/applications - userId: {}, page: {}, size: {}, sort: {}", userId, page, size, sort);
        
        // Parse sort parameter
        String[] sortParams = sort.split(",");
        String sortField = sortParams[0];
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
        
        // Create pageable (page is 1-based in API, 0-based in Spring)
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(direction, sortField));
        
        Page<Application> pageResult = applicationService.getAllApplications(userId, pageable);
        
        // Build response matching API.md section 2.2
        Map<String, Object> response = new HashMap<>();
        response.put("items", pageResult.getContent());
        response.put("page", page);
        response.put("size", size);
        response.put("totalItems", pageResult.getTotalElements());
        response.put("totalPages", pageResult.getTotalPages());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get application by ID
     * GET /api/v1/applications/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(
            Authentication authentication,
            @PathVariable String id
    ) {
        String userId = authentication.getName();
        log.info("GET /api/v1/applications/{} - userId: {}", id, userId);
        
        Application application = applicationService.getApplicationById(id, userId);
        return ResponseEntity.ok(application);
    }
    
    /**
     * Create new application
     * POST /api/v1/applications
     */
    @PostMapping
    public ResponseEntity<Application> createApplication(
            Authentication authentication,
            @Valid @RequestBody CreateApplicationDto dto
    ) {
        String userId = authentication.getName();
        log.info("POST /api/v1/applications - userId: {}, company: {}", userId, dto.getCompanyName());
        
        Application created = applicationService.createApplication(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    /**
     * Update application (partial)
     * PATCH /api/v1/applications/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<Application> updateApplication(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationDto dto
    ) {
        String userId = authentication.getName();
        log.info("PATCH /api/v1/applications/{} - userId: {}", id, userId);
        
        Application updated = applicationService.updateApplication(id, dto, userId);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Delete application
     * DELETE /api/v1/applications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            Authentication authentication,
            @PathVariable String id
    ) {
        String userId = authentication.getName();
        log.info("DELETE /api/v1/applications/{} - userId: {}", id, userId);
        
        applicationService.deleteApplication(id, userId);
        return ResponseEntity.noContent().build();
    }
}
