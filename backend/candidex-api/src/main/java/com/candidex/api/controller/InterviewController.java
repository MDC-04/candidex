package com.candidex.api.controller;

import com.candidex.api.dto.CreateInterviewDto;
import com.candidex.api.dto.UpdateInterviewDto;
import com.candidex.api.model.Interview;
import com.candidex.api.model.enums.InterviewStatus;
import com.candidex.api.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST Controller for interviews
 * Base path: /api/v1/interviews
 */
@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class InterviewController {

    private final InterviewService interviewService;

    /**
     * List interviews with optional filters
     * GET /api/v1/interviews?from=...&to=...&status=...
     */
    @GetMapping
    public ResponseEntity<List<Interview>> listInterviews(
            Authentication authentication,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(required = false) InterviewStatus status
    ) {
        String userId = authentication.getName();
        log.info("GET /api/v1/interviews - userId: {}", userId);

        List<Interview> interviews = interviewService.getInterviews(userId, from, to, status);
        return ResponseEntity.ok(interviews);
    }

    /**
     * Get interview by ID
     * GET /api/v1/interviews/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Interview> getInterviewById(
            Authentication authentication,
            @PathVariable String id
    ) {
        String userId = authentication.getName();
        log.info("GET /api/v1/interviews/{} - userId: {}", id, userId);

        Interview interview = interviewService.getInterviewById(id, userId);
        return ResponseEntity.ok(interview);
    }

    /**
     * Create a new interview
     * POST /api/v1/interviews
     */
    @PostMapping
    public ResponseEntity<Interview> createInterview(
            Authentication authentication,
            @Valid @RequestBody CreateInterviewDto dto
    ) {
        String userId = authentication.getName();
        log.info("POST /api/v1/interviews - userId: {}, app: {}", userId, dto.getApplicationId());

        Interview created = interviewService.createInterview(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update interview (partial)
     * PATCH /api/v1/interviews/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<Interview> updateInterview(
            Authentication authentication,
            @PathVariable String id,
            @Valid @RequestBody UpdateInterviewDto dto
    ) {
        String userId = authentication.getName();
        log.info("PATCH /api/v1/interviews/{} - userId: {}", id, userId);

        Interview updated = interviewService.updateInterview(id, dto, userId);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete interview
     * DELETE /api/v1/interviews/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInterview(
            Authentication authentication,
            @PathVariable String id
    ) {
        String userId = authentication.getName();
        log.info("DELETE /api/v1/interviews/{} - userId: {}", id, userId);

        interviewService.deleteInterview(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get interviews for a specific application
     * GET /api/v1/interviews/by-application/{applicationId}
     */
    @GetMapping("/by-application/{applicationId}")
    public ResponseEntity<List<Interview>> getInterviewsByApplication(
            Authentication authentication,
            @PathVariable String applicationId
    ) {
        String userId = authentication.getName();
        log.info("GET /api/v1/interviews/by-application/{} - userId: {}", applicationId, userId);

        List<Interview> interviews = interviewService.getInterviewsByApplication(applicationId, userId);
        return ResponseEntity.ok(interviews);
    }
}
