# Candidex API

Job application tracking SaaS - Spring Boot backend

## Tech Stack
- Spring Boot 3.4.2
- Java 21
- MongoDB
- Maven

## Getting Started

### Prerequisites
- Java 21
- Maven 3.6+
- MongoDB running on localhost:27017

### Run the application
```bash
mvn spring-boot:run
```

### Build
```bash
mvn clean package
```

### API Documentation
See `/specs/API.md` for complete API contract.

## Project Structure
```
src/main/java/com/candidex/api/
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # MongoDB repositories
├── model/          # Domain entities
├── dto/            # Data Transfer Objects
├── exception/      # Custom exceptions
└── config/         # Configuration classes
```
