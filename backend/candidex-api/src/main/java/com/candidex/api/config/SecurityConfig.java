package com.candidex.api.config;

import com.candidex.api.exception.ApiErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.candidex.api.security.JwtAuthenticationFilter;
import com.candidex.api.security.RateLimitingFilter;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Spring Security Configuration
 * Based on SECURITY.md
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final ObjectMapper objectMapper;

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;
    
    /**
     * Configure HTTP security
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (not needed for stateless JWT authentication)
            .csrf(AbstractHttpConfigurer::disable)
            
            // Enable CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Security headers
            .headers(headers -> headers
                // Prevent clickjacking: page cannot be embedded in iframes
                .frameOptions(frame -> frame.deny())
                // Prevent MIME type sniffing
                .contentTypeOptions(content -> {})
                // Force HTTPS for 1 year (browsers will refuse HTTP)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000)
                )
                // Control which resources the browser is allowed to load
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://img.logo.dev https://logo.clearbit.com data:; connect-src 'self' https://autocomplete.clearbit.com https://nominatim.openstreetmap.org; font-src 'self'; frame-ancestors 'none'")
                )
            )
            
            // Configure authorization
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login").permitAll()

                // Health probe for container orchestration / load balancers
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Standardized JSON responses for 401/403
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) ->
                    writeSecurityError(
                        response,
                        HttpStatus.UNAUTHORIZED,
                        "Authentification requise ou token invalide.",
                        request.getRequestURI()
                    )
                )
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeSecurityError(
                        response,
                        HttpStatus.FORBIDDEN,
                        "Accès refusé pour cette action.",
                        request.getRequestURI()
                    )
                )
            )
            
            // Stateless session (no cookies, JWT only)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Add rate limiting filter before authentication (blocks brute force early)
            .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)

            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * Password encoder bean (BCrypt)
     * Based on SECURITY.md section 3
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * CORS configuration
     * Allows requests from Angular frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private void writeSecurityError(
            HttpServletResponse response,
            HttpStatus status,
            String message,
            String path
    ) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiErrorResponse.of(status, message, path));
    }
}
