package com.candidex.api.dto;

import com.candidex.api.model.enums.InterviewMode;
import com.candidex.api.model.enums.InterviewType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for creating a new interview
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterviewDto {

    @NotBlank(message = "Application ID is required")
    private String applicationId;

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200)
    private String title;

    @NotNull(message = "Type is required")
    private InterviewType type;

    @NotNull(message = "Start date/time is required")
    private Instant startAt;

    private Instant endAt;

    private String timezone;

    @NotNull(message = "Mode is required")
    private InterviewMode mode;

    private String location;

    private String meetingUrl;

    @Size(max = 5000)
    private String notes;

    private List<String> checklistItems;

    private List<String> questionsToAsk;

    private List<String> links;
}
