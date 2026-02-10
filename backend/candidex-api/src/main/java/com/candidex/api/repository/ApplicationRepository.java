package com.candidex.api.repository;

import com.candidex.api.model.Application;
import com.candidex.api.model.enums.ApplicationSource;
import com.candidex.api.model.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

//import java.util.List;
import java.util.Optional;

/**
 * Repository for Application entity
 * Based on API.md section 2
 */
@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    
    /**
     * Find all applications for a user (paginated)
     */
    Page<Application> findByUserId(String userId, Pageable pageable);
    
    /**
     * Find application by ID and userId (ownership check)
     */
    Optional<Application> findByIdAndUserId(String id, String userId);
    
    /**
     * Find by status
     */
    Page<Application> findByUserIdAndStatus(String userId, ApplicationStatus status, Pageable pageable);
    
    /**
     * Find by source
     */
    Page<Application> findByUserIdAndSource(String userId, ApplicationSource source, Pageable pageable);
    
    /**
     * Search by company name or role title (case-insensitive)
     */
    @Query("{ 'userId': ?0, $or: [ { 'companyName': { $regex: ?1, $options: 'i' } }, { 'roleTitle': { $regex: ?1, $options: 'i' } }, { 'notes': { $regex: ?1, $options: 'i' } } ] }")
    Page<Application> searchByUserIdAndQuery(String userId, String query, Pageable pageable);
    
    /**
     * Count applications by user
     */
    long countByUserId(String userId);
    
    /**
     * Count by status for a user
     */
    long countByUserIdAndStatus(String userId, ApplicationStatus status);
    
    /**
     * Delete by ID and userId (ownership check)
     */
    void deleteByIdAndUserId(String id, String userId);
}
