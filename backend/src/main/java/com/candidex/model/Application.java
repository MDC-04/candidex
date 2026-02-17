package com.candidex.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "applications")
public class Application {
    @Id
    private String id;
    
    private String userId;
    
    private String company;
    
    private String position;
    
    private ApplicationStatus status;
    
    private String location;
    
    private String salary;
    
    private String jobUrl;
    
    private String contactPerson;
    
    private String contactEmail;
    
    private List<Note> notes = new ArrayList<>();
    
    private List<Reminder> reminders = new ArrayList<>();
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    private LocalDateTime appliedDate;
    
    public enum ApplicationStatus {
        WISHLIST,
        APPLIED,
        INTERVIEW,
        OFFER,
        REJECTED,
        ACCEPTED
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Note {
        private String id;
        private String content;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reminder {
        private String id;
        private String title;
        private String description;
        private LocalDateTime dueDate;
        private boolean completed;
    }
}
