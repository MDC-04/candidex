# Candidex
Candidex is a data-driven SaaS application designed to help users track, manage, and analyze their job applications through a structured pipeline, reminders, and dashboards.

## Technology Stack

### Backend
- **Spring Boot 3.2.0** - Java framework for building enterprise applications
- **MongoDB** - NoSQL database for flexible data storage
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **Maven** - Build and dependency management

### Frontend
- **Angular 19** - Modern web application framework (upgraded for security patches)
- **TypeScript 5.7** - Type-safe JavaScript
- **RxJS** - Reactive programming
- **CSS** - Styling

## Features

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Password encryption using BCrypt
- Protected routes with auth guards

### Dashboard
- Overview statistics of all applications
- Visual cards showing:
  - Total applications
  - Applied count
  - Interview count
  - Offer count
  - Rejected count
- Status breakdown by category

### Applications Management
- Create, read, update, and delete job applications
- Search and filter functionality
- Track application details:
  - Company name
  - Position title
  - Status (Wishlist, Applied, Interview, Offer, Rejected, Accepted)
  - Location
  - Salary range
  - Job URL
  - Contact person and email
  - Applied date

### Kanban Board
- Visual pipeline view of applications
- Organized by status columns
- Quick status updates via dropdown
- Click to view application details

### Application Details
- Comprehensive view of a single application
- Notes management:
  - Add notes with timestamps
  - Delete notes
- Reminders management:
  - Create reminders with due dates
  - Mark reminders as completed
  - Update and delete reminders

## Prerequisites

Before running the application, ensure you have the following installed:

- **Java 17 or higher** - [Download](https://adoptium.net/)
- **Maven 3.6+** - [Download](https://maven.apache.org/download.cgi)
- **MongoDB 5.0+** - [Download](https://www.mongodb.com/try/download/community)
- **Node.js 18+ and npm** - [Download](https://nodejs.org/)
- **Angular CLI** - Install with `npm install -g @angular/cli`

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/MDC-04/Candidex.git
cd Candidex
```

### 2. Backend Setup

#### Start MongoDB
Make sure MongoDB is running on your local machine:
```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Configure Application Properties (Optional)
The default configuration uses MongoDB on `localhost:27017` with database name `candidex`. 
To customize, edit `backend/src/main/resources/application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/candidex

# JWT Configuration (Change secret in production!)
jwt.secret=your-secret-key-here
jwt.expiration=86400000
```

#### Build and Run the Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

#### Verify Backend is Running
```bash
curl http://localhost:8080/api/auth/signup
# Should return a method not allowed or bad request (expected for GET on POST endpoint)
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Run the Development Server
```bash
npm start
# Or
ng serve
```

The frontend will start on `http://localhost:4200`

#### Build for Production
```bash
ng build --configuration production
```

## Usage Guide

### 1. Register a New Account
- Navigate to `http://localhost:4200`
- You'll be redirected to the login page
- Click "Sign up" 
- Enter username (min 3 characters), email, and password (min 6 characters)
- Click "Sign Up"

### 2. Login
- Enter your username and password
- Click "Login"
- You'll be redirected to the dashboard

### 3. Dashboard
- View your application statistics
- Click "View All Applications" to see the list
- Click "Open Kanban Board" for the pipeline view

### 4. Manage Applications
- Click "+ Add Application" to create a new application
- Fill in the company, position, and status (required)
- Optionally add location, salary, URL, and contact information
- Click "Save"

### 5. View Application Details
- Click "View" on any application card
- Add notes to track important information
- Create reminders for follow-ups or deadlines
- Mark reminders as completed when done

### 6. Kanban Board
- Drag or use the dropdown to change application status
- Click on any card to view full details
- Visual representation of your application pipeline

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Applications (Requires Authentication)
- `GET /api/applications` - Get all user applications
- `GET /api/applications/{id}` - Get specific application
- `POST /api/applications` - Create new application
- `PUT /api/applications/{id}` - Update application
- `DELETE /api/applications/{id}` - Delete application
- `GET /api/applications/stats` - Get dashboard statistics

### Notes
- `POST /api/applications/{id}/notes` - Add note
- `DELETE /api/applications/{id}/notes/{noteId}` - Delete note

### Reminders
- `POST /api/applications/{id}/reminders` - Add reminder
- `PUT /api/applications/{id}/reminders/{reminderId}` - Update reminder
- `DELETE /api/applications/{id}/reminders/{reminderId}` - Delete reminder

## Project Structure

```
Candidex/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/candidex/
│   │   │   │   ├── config/          # Security and app configuration
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── model/           # Domain models
│   │   │   │   ├── repository/      # MongoDB repositories
│   │   │   │   ├── security/        # JWT and auth components
│   │   │   │   └── service/         # Business logic
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                    # Unit tests
│   └── pom.xml                      # Maven configuration
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/          # Angular components
│   │   │   │   ├── auth/           # Login and signup
│   │   │   │   ├── dashboard/      # Dashboard view
│   │   │   │   ├── applications/   # Applications list
│   │   │   │   ├── kanban/         # Kanban board
│   │   │   │   └── application-detail/ # Detail view
│   │   │   ├── guards/             # Route guards
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   ├── services/           # API services
│   │   │   └── app.routes.ts       # Route configuration
│   │   └── styles.css              # Global styles
│   ├── angular.json                # Angular configuration
│   └── package.json                # npm dependencies
└── README.md
```

## Development

### Backend Development
The backend uses Spring Boot with auto-reload capabilities:
```bash
cd backend
mvn spring-boot:run
```

### Frontend Development
Angular CLI provides hot-reload:
```bash
cd frontend
ng serve
```

### Running Tests

#### Backend Tests
```bash
cd backend
mvn test
```

#### Frontend Tests
```bash
cd frontend
ng test
```

## Security Considerations

### Production Deployment
Before deploying to production:

1. **Change JWT Secret**: Update `jwt.secret` in `application.properties` with a strong, random string
2. **Use Environment Variables**: Store sensitive data in environment variables
3. **Enable HTTPS**: Configure SSL/TLS certificates
4. **Update CORS**: Modify `SecurityConfig.java` to allow only your production domain
5. **MongoDB Security**: Enable authentication and use secure connection strings
6. **Password Policy**: Consider implementing stronger password requirements

## Troubleshooting

### Backend Issues
- **MongoDB Connection Failed**: Ensure MongoDB is running on port 27017
- **Port 8080 Already in Use**: Change port in `application.properties` with `server.port=8081`

### Frontend Issues
- **Cannot connect to backend**: Verify backend is running on `http://localhost:8080`
- **CORS Errors**: Check that CORS is configured correctly in `SecurityConfig.java`
- **Port 4200 Already in Use**: Run with different port: `ng serve --port 4201`

### Common Issues
- **401 Unauthorized**: Check that JWT token is valid and included in request headers
- **404 Not Found**: Verify API endpoints match between frontend services and backend controllers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check existing issues for solutions

## Future Enhancements

- Email notifications for reminders
- Calendar integration
- Resume/CV attachment upload
- Interview preparation checklist
- Salary comparison analytics
- Job application templates
- Export data to PDF/CSV
- Mobile application

