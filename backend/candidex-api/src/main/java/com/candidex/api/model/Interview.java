package com.candidex.api.model;

import com.candidex.api.model.enums.InterviewMode;
import com.candidex.api.model.enums.InterviewStatus;
import com.candidex.api.model.enums.InterviewType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

/**
 * Interview entity - linked to an Application
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "interviews")
@CompoundIndex(name = "user_startAt_idx", def = "{'userId': 1, 'startAt': 1}")
@CompoundIndex(name = "user_app_idx", def = "{'userId': 1, 'applicationId': 1}")
public class Interview {

    @Id
    private String id;

    @NotBlank(message = "User ID is required")
    @Indexed
    private String userId;

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

    @Builder.Default
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Size(max = 5000)
    private String notes;

    @Size(max = 5000)
    private String feedback;

    private List<String> checklistItems;

    private List<String> questionsToAsk;

    private List<String> links;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
