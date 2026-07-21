# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first for faster rebuilds
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build the application
COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Run as a non-root user
RUN addgroup -S candidex && adduser -S candidex -G candidex

# Copy the fat jar produced by the build stage
COPY --from=build /app/target/candidex-api-*.jar app.jar

# Directory for uploaded CVs (mounted as a volume in docker-compose)
RUN mkdir -p /app/uploads/cvs && chown -R candidex:candidex /app

USER candidex

EXPOSE 8080

# JAVA_OPTS can be overridden at runtime (e.g. memory limits)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
