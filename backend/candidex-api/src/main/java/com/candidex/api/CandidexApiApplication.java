package com.candidex.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

/**
 * Candidex API - Main Application
 * 
 * Job application tracking SaaS backend.
 * Built with Spring Boot, MongoDB, and following REST best practices.
 * 
 * @author Candidex Team
 * @version 1.0.0
 */
// We authenticate users ourselves via JWT (see SecurityConfig / AuthService),
// so we disable Spring Security's default in-memory user (which otherwise logs
// a "Using generated security password" line and creates an unused default user).
@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
public class CandidexApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CandidexApiApplication.class, args);
    }
}
