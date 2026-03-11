package com.candidex.service;

import com.candidex.dto.DashboardStatsResponse;
import com.candidex.model.Application;
import com.candidex.repository.ApplicationRepository;
import com.candidex.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    
    private String getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userDetails.getId();
    }
    
    public List<Application> getAllApplications() {
        String userId = getCurrentUserId();
        return applicationRepository.findByUserId(userId);
    }
    
    public Application getApplicationById(String id) {
        String userId = getCurrentUserId();
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        return application;
    }
    
    public Application createApplication(Application application) {
        String userId = getCurrentUserId();
        application.setUserId(userId);
        return applicationRepository.save(application);
    }
    
    public Application updateApplication(String id, Application applicationDetails) {
        String userId = getCurrentUserId();
        Application application = getApplicationById(id);
        
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        application.setCompany(applicationDetails.getCompany());
        application.setPosition(applicationDetails.getPosition());
        application.setStatus(applicationDetails.getStatus());
        application.setLocation(applicationDetails.getLocation());
        application.setSalary(applicationDetails.getSalary());
        application.setJobUrl(applicationDetails.getJobUrl());
        application.setContactPerson(applicationDetails.getContactPerson());
        application.setContactEmail(applicationDetails.getContactEmail());
        application.setAppliedDate(applicationDetails.getAppliedDate());
        
        return applicationRepository.save(application);
    }
    
    public void deleteApplication(String id) {
        String userId = getCurrentUserId();
        Application application = getApplicationById(id);
        
        if (!application.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        
        applicationRepository.deleteById(id);
    }
    
    public Application addNote(String id, Application.Note note) {
        Application application = getApplicationById(id);
        note.setId(UUID.randomUUID().toString());
        application.getNotes().add(note);
        return applicationRepository.save(application);
    }
    
    public Application deleteNote(String id, String noteId) {
        Application application = getApplicationById(id);
        application.getNotes().removeIf(note -> note.getId().equals(noteId));
        return applicationRepository.save(application);
    }
    
    public Application addReminder(String id, Application.Reminder reminder) {
        Application application = getApplicationById(id);
        reminder.setId(UUID.randomUUID().toString());
        application.getReminders().add(reminder);
        return applicationRepository.save(application);
    }
    
    public Application updateReminder(String id, String reminderId, Application.Reminder reminderDetails) {
        Application application = getApplicationById(id);
        application.getReminders().stream()
                .filter(r -> r.getId().equals(reminderId))
                .findFirst()
                .ifPresent(reminder -> {
                    reminder.setTitle(reminderDetails.getTitle());
                    reminder.setDescription(reminderDetails.getDescription());
                    reminder.setDueDate(reminderDetails.getDueDate());
                    reminder.setCompleted(reminderDetails.isCompleted());
                });
        return applicationRepository.save(application);
    }
    
    public Application deleteReminder(String id, String reminderId) {
        Application application = getApplicationById(id);
        application.getReminders().removeIf(reminder -> reminder.getId().equals(reminderId));
        return applicationRepository.save(application);
    }
    
    public DashboardStatsResponse getDashboardStats() {
        String userId = getCurrentUserId();
        
        long total = applicationRepository.countByUserId(userId);
        long applied = applicationRepository.countByUserIdAndStatus(userId, Application.ApplicationStatus.APPLIED);
        long interview = applicationRepository.countByUserIdAndStatus(userId, Application.ApplicationStatus.INTERVIEW);
        long offer = applicationRepository.countByUserIdAndStatus(userId, Application.ApplicationStatus.OFFER);
        long rejected = applicationRepository.countByUserIdAndStatus(userId, Application.ApplicationStatus.REJECTED);
        
        Map<String, Long> statusBreakdown = new HashMap<>();
        for (Application.ApplicationStatus status : Application.ApplicationStatus.values()) {
            long count = applicationRepository.countByUserIdAndStatus(userId, status);
            statusBreakdown.put(status.name(), count);
        }
        
        return new DashboardStatsResponse(total, applied, interview, offer, rejected, statusBreakdown);
    }
}
