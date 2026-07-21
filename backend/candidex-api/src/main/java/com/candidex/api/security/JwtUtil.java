package com.candidex.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for JWT token generation and validation
 * Based on SECURITY.md section 2
 */
@Component
public class JwtUtil {

    /** HMAC-SHA256 requires a key of at least 256 bits (32 bytes). */
    private static final int MIN_SECRET_BYTES = 32;

    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private long expiration;

    /**
     * Fail fast at startup if the configured secret is missing or too weak.
     * This prevents accidentally shipping an insecure signing key to production.
     */
    @PostConstruct
    void validateSecret() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "jwt.secret must be configured with at least " + MIN_SECRET_BYTES
                    + " bytes (256 bits). Set the JWT_SECRET environment variable.");
        }
    }
    
    /**
     * Generate JWT token for a user
     * 
     * @param userId User ID
     * @param email User email
     * @return JWT token string
     */
    public String generateToken(String userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        
        return Jwts.builder()
                .claims(claims)
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Extract userId from JWT token
     * 
     * @param token JWT token
     * @return User ID
     */
    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }
    
    /**
     * Extract email from JWT token
     * 
     * @param token JWT token
     * @return Email
     */
    public String extractEmail(String token) {
        return extractClaims(token).get("email", String.class);
    }
    
    /**
     * Validate JWT token
     * 
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Extract all claims from JWT token
     * 
     * @param token JWT token
     * @return Claims
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    /**
     * Check if token is expired
     * 
     * @param token JWT token
     * @return true if expired
     */
    private boolean isTokenExpired(String token) {
        Date expiration = extractClaims(token).getExpiration();
        return expiration.before(new Date());
    }
    
    /**
     * Get signing key from secret
     * 
     * @return SecretKey
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
