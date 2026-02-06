package com.candidex.repository;

import com.candidex.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    List<Application> findByUserId(String userId);
    List<Application> findByUserIdAndStatus(String userId, Application.ApplicationStatus status);
    long countByUserId(String userId);
    long countByUserIdAndStatus(String userId, Application.ApplicationStatus status);
}
