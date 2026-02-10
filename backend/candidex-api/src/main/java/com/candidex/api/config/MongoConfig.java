package com.candidex.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB configuration
 * Enables auditing for @CreatedDate and @LastModifiedDate
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
    // Auditing enabled automatically
}
