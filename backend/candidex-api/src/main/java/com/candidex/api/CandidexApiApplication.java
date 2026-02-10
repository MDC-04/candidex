package com.candidex.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Candidex API - Main Application
 * 
 * Job application tracking SaaS backend.
 * Built with Spring Boot, MongoDB, and following REST best practices.
 * 
 * @author Candidex Team
 * @version 1.0.0
 */
@SpringBootApplication
public class CandidexApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CandidexApiApplication.class, args);
    }
}
