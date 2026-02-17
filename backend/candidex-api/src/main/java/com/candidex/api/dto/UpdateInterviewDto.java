package com.candidex.api.dto;

import com.candidex.api.model.enums.InterviewMode;
import com.candidex.api.model.enums.InterviewStatus;
import com.candidex.api.model.enums.InterviewType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for updating an interview (partial update, all fields optional)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateInterviewDto {

    private String title;

    private InterviewType type;

    private Instant startAt;

    private Instant endAt;

    private String timezone;

    private InterviewMode mode;

    private String location;

    private String meetingUrl;

    private InterviewStatus status;

    @Size(max = 5000)
    private String notes;

    @Size(max = 5000)
    private String feedback;

    private List<String> checklistItems;

    private List<String> questionsToAsk;

    private List<String> links;
}
