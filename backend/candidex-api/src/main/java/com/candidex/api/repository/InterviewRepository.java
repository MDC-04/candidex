package com.candidex.api.repository;

import com.candidex.api.model.Interview;
import com.candidex.api.model.enums.InterviewStatus;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Interview entity
 */
@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {

    /**
     * Find interview by ID and userId (ownership check)
     */
    Optional<Interview> findByIdAndUserId(String id, String userId);

    /**
     * Find all interviews for a user, sorted
     */
    List<Interview> findByUserId(String userId, Sort sort);

    /**
     * Find interviews by user and status
     */
    List<Interview> findByUserIdAndStatus(String userId, InterviewStatus status, Sort sort);

    /**
     * Find interviews for a user within a date range
     */
    @Query("{ 'userId': ?0, 'startAt': { $gte: ?1, $lte: ?2 } }")
    List<Interview> findByUserIdAndDateRange(String userId, Instant from, Instant to, Sort sort);

    /**
     * Find interviews for a specific application
     */
    List<Interview> findByUserIdAndApplicationId(String userId, String applicationId, Sort sort);

    /**
     * Find upcoming scheduled interviews for a user (startAt > now, status = SCHEDULED)
     */
    @Query("{ 'userId': ?0, 'status': 'SCHEDULED', 'startAt': { $gte: ?1 } }")
    List<Interview> findUpcomingByUserId(String userId, Instant from, Sort sort);

    /**
     * Count interviews by user
     */
    long countByUserId(String userId);

    /**
     * Delete all interviews for a given application (cleanup)
     */
    void deleteByApplicationIdAndUserId(String applicationId, String userId);
}
