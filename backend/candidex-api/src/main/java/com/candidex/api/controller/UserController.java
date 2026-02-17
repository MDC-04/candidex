package com.candidex.api.controller;

import com.candidex.api.dto.UpdateProfileDto;
import com.candidex.api.dto.UserProfileDto;
import com.candidex.api.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for user profile management
 */
@RestController
@RequestMapping("/api/v1/users")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private static final String CV_UPLOAD_DIR = "uploads/cvs/";
    
    /**
     * Get current user profile
     * GET /api/v1/users/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update current user profile
     * PUT /api/v1/users/profile
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(
            @Valid @RequestBody UpdateProfileDto dto,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        UserProfileDto profile = userService.updateProfile(userId, dto);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Upload CV file
     * POST /api/v1/users/profile/cv
     */
    @PostMapping(value = "/profile/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadCv(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            String userId = authentication.getName();
            
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le fichier est vide"));
            }
            
            // Check file size (max 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Le fichier est trop volumineux (max 5 MB)"));
            }
            
            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.matches("application/(pdf|msword|vnd\\.openxmlformats-officedocument\\.wordprocessingml\\.document)")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Format de fichier non accepté"));
            }
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(CV_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String filename = userId + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            
            // Delete old CV if exists
            String oldFilename = userService.getCvFilename(userId);
            if (oldFilename != null) {
                Path oldFilePath = uploadPath.resolve(oldFilename);
                Files.deleteIfExists(oldFilePath);
            }
            
            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Update user profile with CV filenames (stored and original)
            userService.updateCvFilenames(userId, filename, originalFilename);
            
            Map<String, String> response = new HashMap<>();
            response.put("filename", originalFilename);
            response.put("message", "CV uploadé avec succès");
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de l'upload du CV"));
        }
    }
    
    /**
     * Download CV file
     * GET /api/v1/users/profile/cv
     */
    @GetMapping("/profile/cv")
    public ResponseEntity<Resource> downloadCv(Authentication authentication) {
        try {
            String userId = authentication.getName();
            String filename = userService.getCvFilename(userId);
            
            if (filename == null) {
                return ResponseEntity.notFound().build();
            }
            
            Path filePath = Paths.get(CV_UPLOAD_DIR).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
                    
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Delete CV file
     * DELETE /api/v1/users/profile/cv
     */
    @DeleteMapping("/profile/cv")
    public ResponseEntity<Map<String, String>> deleteCv(Authentication authentication) {
        try {
            String userId = authentication.getName();
            String filename = userService.getCvFilename(userId);
            
            if (filename != null) {
                Path filePath = Paths.get(CV_UPLOAD_DIR).resolve(filename);
                Files.deleteIfExists(filePath);
            }
            
            userService.deleteCvFilename(userId);
            
            return ResponseEntity.ok(Map.of("message", "CV supprimé avec succès"));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la suppression du CV"));
        }
    }
}
