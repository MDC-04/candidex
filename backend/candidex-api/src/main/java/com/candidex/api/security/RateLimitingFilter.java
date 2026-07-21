package com.candidex.api.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting filter for authentication endpoints.
 * Uses the Token Bucket algorithm (Bucket4j) to limit
 * login/register attempts to 10 requests per minute per IP.
 *
 * This prevents brute-force attacks on the login endpoint.
 */
@Component
public class RateLimitingFilter implements Filter {

    // One bucket per IP address, stored in a thread-safe map
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS = 10;
    private static final Duration REFILL_PERIOD = Duration.ofMinutes(1);

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) servletRequest;
        String path = request.getRequestURI();

        // Only rate-limit auth endpoints
        if (path.startsWith("/api/v1/auth/")) {
            String clientIp = getClientIp(request);
            Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createBucket());

            if (bucket.tryConsume(1)) {
                chain.doFilter(servletRequest, servletResponse);
            } else {
                HttpServletResponse response = (HttpServletResponse) servletResponse;
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(
                    "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Trop de tentatives. Réessayez dans une minute.\"}"
                );
            }
        } else {
            chain.doFilter(servletRequest, servletResponse);
        }
    }

    private Bucket createBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(MAX_REQUESTS)
                        .refillGreedy(MAX_REQUESTS, REFILL_PERIOD)
                        .build())
                .build();
    }

    /**
     * Extract client IP, handling reverse proxy headers (X-Forwarded-For).
     * In production behind Nginx/Caddy, the real IP is in X-Forwarded-For.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
            // The first one is the real client IP
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
