package com.candidex.controller;

import com.candidex.dto.DashboardStatsResponse;
import com.candidex.model.Application;
import com.candidex.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicationController {
    private final ApplicationService applicationService;
    
    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationService.getAllApplications());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Application> getApplicationById(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getApplicationById(id));
    }
    
    @PostMapping
    public ResponseEntity<Application> createApplication(@Valid @RequestBody Application application) {
        return ResponseEntity.ok(applicationService.createApplication(application));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Application> updateApplication(@PathVariable String id, 
                                                         @Valid @RequestBody Application application) {
        return ResponseEntity.ok(applicationService.updateApplication(id, application));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/notes")
    public ResponseEntity<Application> addNote(@PathVariable String id, 
                                               @Valid @RequestBody Application.Note note) {
        return ResponseEntity.ok(applicationService.addNote(id, note));
    }
    
    @DeleteMapping("/{id}/notes/{noteId}")
    public ResponseEntity<Application> deleteNote(@PathVariable String id, @PathVariable String noteId) {
        return ResponseEntity.ok(applicationService.deleteNote(id, noteId));
    }
    
    @PostMapping("/{id}/reminders")
    public ResponseEntity<Application> addReminder(@PathVariable String id, 
                                                   @Valid @RequestBody Application.Reminder reminder) {
        return ResponseEntity.ok(applicationService.addReminder(id, reminder));
    }
    
    @PutMapping("/{id}/reminders/{reminderId}")
    public ResponseEntity<Application> updateReminder(@PathVariable String id, 
                                                      @PathVariable String reminderId,
                                                      @Valid @RequestBody Application.Reminder reminder) {
        return ResponseEntity.ok(applicationService.updateReminder(id, reminderId, reminder));
    }
    
    @DeleteMapping("/{id}/reminders/{reminderId}")
    public ResponseEntity<Application> deleteReminder(@PathVariable String id, @PathVariable String reminderId) {
        return ResponseEntity.ok(applicationService.deleteReminder(id, reminderId));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(applicationService.getDashboardStats());
    }
}
