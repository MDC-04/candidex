package com.candidex.api.service;

import com.candidex.api.dto.CreateInterviewDto;
import com.candidex.api.dto.UpdateInterviewDto;
import com.candidex.api.model.Interview;
import com.candidex.api.model.enums.InterviewStatus;
import com.candidex.api.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Service for managing interviews
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewService {

    private final InterviewRepository interviewRepository;

    /**
     * Get all interviews for a user with optional filters
     */
    public List<Interview> getInterviews(String userId, Instant from, Instant to, InterviewStatus status) {
        Sort sort = Sort.by(Sort.Direction.ASC, "startAt");

        if (from != null && to != null) {
            List<Interview> interviews = interviewRepository.findByUserIdAndDateRange(userId, from, to, sort);
            if (status != null) {
                return interviews.stream().filter(i -> i.getStatus() == status).toList();
            }
            return interviews;
        }

        if (status != null) {
            return interviewRepository.findByUserIdAndStatus(userId, status, sort);
        }

        return interviewRepository.findByUserId(userId, sort);
    }

    /**
     * Get interview by ID (with ownership check)
     */
    public Interview getInterviewById(String id, String userId) {
        return interviewRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Interview not found or access denied"));
    }

    /**
     * Get interviews for a specific application
     */
    public List<Interview> getInterviewsByApplication(String applicationId, String userId) {
        Sort sort = Sort.by(Sort.Direction.ASC, "startAt");
        return interviewRepository.findByUserIdAndApplicationId(userId, applicationId, sort);
    }

    /**
     * Create a new interview
     */
    @Transactional
    public Interview createInterview(CreateInterviewDto dto, String userId) {
        log.info("Creating interview for user: {}, application: {}", userId, dto.getApplicationId());

        // Validate endAt >= startAt if provided
        if (dto.getEndAt() != null && dto.getEndAt().isBefore(dto.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Interview interview = Interview.builder()
                .userId(userId)
                .applicationId(dto.getApplicationId())
                .title(dto.getTitle())
                .type(dto.getType())
                .startAt(dto.getStartAt())
                .endAt(dto.getEndAt())
                .timezone(dto.getTimezone())
                .mode(dto.getMode())
                .location(dto.getLocation())
                .meetingUrl(dto.getMeetingUrl())
                .status(InterviewStatus.SCHEDULED)
                .notes(dto.getNotes())
                .checklistItems(dto.getChecklistItems())
                .questionsToAsk(dto.getQuestionsToAsk())
                .links(dto.getLinks())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return interviewRepository.save(interview);
    }

    /**
     * Update an existing interview (partial update)
     */
    @Transactional
    public Interview updateInterview(String id, UpdateInterviewDto dto, String userId) {
        log.info("Updating interview {} for user {}", id, userId);

        Interview interview = getInterviewById(id, userId);

        if (dto.getTitle() != null) interview.setTitle(dto.getTitle());
        if (dto.getType() != null) interview.setType(dto.getType());
        if (dto.getStartAt() != null) interview.setStartAt(dto.getStartAt());
        if (dto.getEndAt() != null) interview.setEndAt(dto.getEndAt());
        if (dto.getTimezone() != null) interview.setTimezone(dto.getTimezone());
        if (dto.getMode() != null) interview.setMode(dto.getMode());
        if (dto.getLocation() != null) interview.setLocation(dto.getLocation());
        if (dto.getMeetingUrl() != null) interview.setMeetingUrl(dto.getMeetingUrl());
        if (dto.getStatus() != null) interview.setStatus(dto.getStatus());
        if (dto.getNotes() != null) interview.setNotes(dto.getNotes());
        if (dto.getFeedback() != null) interview.setFeedback(dto.getFeedback());
        if (dto.getChecklistItems() != null) interview.setChecklistItems(dto.getChecklistItems());
        if (dto.getQuestionsToAsk() != null) interview.setQuestionsToAsk(dto.getQuestionsToAsk());
        if (dto.getLinks() != null) interview.setLinks(dto.getLinks());

        // Validate endAt >= startAt
        if (interview.getEndAt() != null && interview.getStartAt() != null
                && interview.getEndAt().isBefore(interview.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        interview.setUpdatedAt(Instant.now());
        return interviewRepository.save(interview);
    }

    /**
     * Delete an interview (with ownership check)
     */
    @Transactional
    public void deleteInterview(String id, String userId) {
        log.info("Deleting interview {} for user {}", id, userId);
        Interview interview = getInterviewById(id, userId);
        interviewRepository.delete(interview);
    }
}
