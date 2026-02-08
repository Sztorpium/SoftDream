# Database Setup Guide

This application supports two database configurations using Spring Profiles:
- **H2** (in-memory database) for development
- **MySQL** for production

## H2 Database (Development)

H2 is an in-memory database that provides a lightweight development environment without requiring a separate database server.

### Running with H2 (Default)

The application uses H2 by default. Simply run:

```bash
mvn spring-boot:run
```

Or explicitly specify the H2 profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### H2 Console Access

When running with the H2 profile, you can access the H2 web console to view and query the database:

- **URL**: http://localhost:8080/api/h2-console
- **JDBC URL**: `jdbc:h2:mem:softdream_hotel`
- **Username**: `sa`
- **Password**: (leave empty)

### H2 Configuration Details

- **Database Type**: In-memory (data is cleared on application restart)
- **DDL Auto**: `create-drop` (schema recreated on each startup)
- **Dialect**: H2Dialect

## MySQL Database (Production)

MySQL provides a persistent database suitable for production environments.

### Prerequisites

1. Install MySQL server (version 8.0 or higher)
2. Ensure MySQL is running on `localhost:3306`
3. Set environment variables for database credentials (optional):
   - `DB_USERNAME` (default: `root`)
   - `DB_PASSWORD` (default: `changeme`)

### Running with MySQL

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

Or set the environment variable:

```bash
export SPRING_PROFILES_ACTIVE=mysql
mvn spring-boot:run
```

### MySQL Configuration Details

- **Database Name**: `softdream_hotel` (automatically created if it doesn't exist)
- **DDL Auto**: `update` (schema updated incrementally)
- **Dialect**: MySQL8Dialect
- **Timezone**: Europe/Budapest

## Benefits of Each Database

### H2 Benefits
- ✅ No installation or setup required
- ✅ Fast startup and execution
- ✅ Built-in web console for easy inspection
- ✅ Perfect for development and testing
- ✅ No external dependencies
- ❌ Data lost on restart
- ❌ Not suitable for production

### MySQL Benefits
- ✅ Data persistence across restarts
- ✅ Production-ready and scalable
- ✅ Industry-standard relational database
- ✅ Advanced features and optimizations
- ❌ Requires separate database server
- ❌ More complex setup

## Switching Between Databases

You can easily switch between databases by changing the active profile:

1. **Via command line**:
   ```bash
   # H2
   mvn spring-boot:run -Dspring-boot.run.profiles=h2
   
   # MySQL
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

2. **Via environment variable**:
   ```bash
   export SPRING_PROFILES_ACTIVE=h2  # or mysql
   mvn spring-boot:run
   ```

3. **Via application.properties**:
   Edit `src/main/resources/application.properties` and change:
   ```properties
   spring.profiles.active=h2  # or mysql
   ```

## Environment Variables

For production deployments, use environment variables to protect sensitive information:

### MySQL
- `DB_USERNAME`: MySQL username (default: `root`)
- `DB_PASSWORD`: MySQL password (default: `changeme`)

### JWT
- `JWT_SECRET`: Secret key for JWT token generation

### Mail
- `MAIL_USERNAME`: Email address for SMTP
- `MAIL_PASSWORD`: App password for email service

## Troubleshooting

### H2 Database Issues

**Problem**: Cannot access H2 console
- **Solution**: Ensure you're using the H2 profile and the application is running
- Check the URL: http://localhost:8080/api/h2-console

**Problem**: Database tables not created
- **Solution**: H2 uses `create-drop`, so tables are created automatically on startup

### MySQL Database Issues

**Problem**: Cannot connect to MySQL
- **Solution**: 
  1. Verify MySQL is running: `sudo systemctl status mysql`
  2. Check credentials in environment variables or configuration
  3. Ensure the database allows connections from localhost

**Problem**: Authentication error
- **Solution**: Update `DB_USERNAME` and `DB_PASSWORD` environment variables or modify the `application-mysql.properties` file

**Problem**: Timezone issues
- **Solution**: The configuration uses `Europe/Budapest` timezone. Modify if needed in `application-mysql.properties`

## Testing

For integration tests, the application uses Testcontainers with MySQL, which automatically starts a MySQL Docker container during tests.
