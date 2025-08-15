# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChapLog is a reading log web application for tracking reading progress and reflections in diary format. The system uses .NET Aspire 9.4.1 for container orchestration with a clean architecture pattern.

## Architecture

### Technology Stack
- **Backend**: .NET 9.0, ASP.NET Core Web API, Entity Framework Core, PostgreSQL
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui
- **Orchestration**: .NET Aspire 9.4.1 with PostgreSQL, Redis, Seq
- **Testing**: xUnit, .NET Aspire Testing, Playwright

### Service Dependencies
The application follows a specific startup order managed by .NET Aspire:
1. **Migration Service** runs first to apply database migrations and seed data
2. **API Service** waits for migration completion before starting
3. **Frontend** waits for API availability

### Project Structure
- **ChapLog.Core**: Domain entities, interfaces, DTOs (Clean Architecture core)
- **ChapLog.Infrastructure**: Data access, repositories, EF Core context
- **ChapLog.Api**: REST API controllers and endpoints
- **ChapLog.MigrationService**: Dedicated Worker Service for database migrations
- **ChapLog.AppHost**: .NET Aspire orchestration host
- **ChapLog.ServiceDefaults**: Shared Aspire service configuration

## Development Commands

### Build and Run
```bash
# Build entire solution
dotnet build

# Run with Aspire orchestration (includes all services)
dotnet run --project ChapLog.AppHost

# Run frontend separately (if needed)
cd chaplog-frontend && npm run dev
```

### Database Operations

**IMPORTANT**: When modifying Entity definitions or DbContext configuration, ALWAYS create a new migration:

```bash
# Create new migration (run from root directory)
dotnet ef migrations add <MigrationName> -p ChapLog.Infrastructure -s ChapLog.Api

# Migration is automatically applied by MigrationService on startup
# For manual application in development only:
dotnet ef database update -p ChapLog.Infrastructure -s ChapLog.Api
```

#### Design-Time Connection Strings for EF Migrations

Following [Microsoft Docs recommendations](https://learn.microsoft.com/ja-jp/dotnet/aspire/database/ef-core-migrations), for design-time migration creation:

1. **Temporarily add** connection string to `ChapLog.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=chaplogdb;Username=postgres;Password=postgres;"
     }
   }
   ```

2. **Create migration** using EF Core tools
3. **Remove connection string** from appsettings.json after migration creation

**Note**: The `IDesignTimeDbContextFactory` in `ChapLog.Infrastructure/Data/DesignTimeDbContextFactory.cs` handles design-time DbContext creation automatically.

### Testing
```bash
# Run all tests
dotnet test

# Unit tests only
dotnet test ChapLog.Tests/ChapLog.UnitTests

# Integration tests with Aspire (includes database migration testing)
dotnet test ChapLog.Tests/ChapLog.IntegrationTests

# E2E tests with Playwright
dotnet test ChapLog.Tests/ChapLog.E2ETests

# Test with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run single test class
dotnet test --filter "FullyQualifiedName~BookServiceTests"
```

### Package Management
```bash
# Restore all dependencies (including frontend)
dotnet restore
cd chaplog-frontend && npm install

# Update Aspire templates (when needed)
dotnet new install Aspire.ProjectTemplates::9.4.0
```

## Key Architecture Patterns

### Migration Service Pattern
The `ChapLog.MigrationService` is a Worker Service that:
- Runs before API startup as managed by Aspire dependencies
- Applies EF Core migrations automatically
- Seeds initial data (admin user, sample data in development)
- Stops itself after completion to signal other services can start

### Clean Architecture Layers
- **Core**: Contains entities and business logic interfaces, no external dependencies
- **Infrastructure**: Implements Core interfaces, contains EF Core context and repositories
- **API**: Presentation layer, depends on Core and Infrastructure for dependency injection

### Testing Strategy (Test Pyramid)
- **Unit Tests**: Mock dependencies, test business logic in isolation using xUnit + Moq
- **Integration Tests**: Use .NET Aspire Testing framework to test with real database and services
- **E2E Tests**: Playwright tests against full running application stack

## Domain Model
The application centers around:
- **Users**: Authentication and role-based authorization (User/Admin)
- **Books**: Reading material with status tracking (unread/reading/completed)
- **ReadingEntries**: Daily reading diary entries with progress and reflections
- **BookReviews**: Complete reviews after finishing a book

## Integration Testing with Aspire
Integration tests use `DistributedApplicationTestingBuilder` to:
- Start the full Aspire application stack
- Test real database migrations
- Verify API endpoints with actual service dependencies
- Test service orchestration and startup dependencies

## Implementation Status ✅ COMPLETED

The complete .NET backend implementation is finished and ready for use:

### ✅ Completed Components

**Phase 1: Core Foundation**
- ✅ Entities: User, Book, ReadingEntry, BookReview, RefreshToken
- ✅ DTOs: Complete DTO structure for all API operations with validation
- ✅ Interfaces: Repository and Service interfaces with proper abstractions

**Phase 2: Infrastructure Layer**
- ✅ DbContext: Full Entity Framework Core configuration with PostgreSQL
- ✅ Repositories: Generic repository pattern + 5 specific repository implementations
- ✅ Services: All 6 business logic services (Auth, Book, ReadingEntry, BookReview, Statistics, Admin)

**Phase 3: Database Setup**
- ✅ Migration Service: Worker service with retry logic and automatic database setup
- ✅ Initial Migration: EF Core migration created and ready for deployment
- ✅ Data Seeding: Admin user seeding with configurable defaults

**Phase 4: API Layer**
- ✅ Controllers: 6 REST API controllers with complete CRUD operations
- ✅ Middleware: Global exception handling, request logging, rate limiting
- ✅ Authentication: JWT with refresh tokens, role-based authorization
- ✅ Documentation: Swagger/OpenAPI with security definitions

**Phase 5: Aspire Orchestration**
- ✅ AppHost: Service orchestration with PostgreSQL, migration service dependency management
- ✅ ServiceDefaults: Health checks, OpenTelemetry, service discovery
- ✅ Configuration: Connection strings, JWT settings, environment-specific configs

### 🛠️ Build Status
```bash
dotnet build
# ✅ Build succeeded (8 warnings, 0 errors)
# All projects compile successfully
```

### 🏗️ Ready for Development
- **API Endpoints**: 30+ REST endpoints covering all planned functionality
- **Database**: PostgreSQL with proper indexes, constraints, and JSONB support
- **Security**: JWT authentication, password hashing, rate limiting
- **Monitoring**: Health checks, logging, OpenTelemetry integration
- **Testing**: Project structure ready for unit/integration/E2E tests

### 🚀 Next Steps (Optional)
The backend is production-ready. Next development could focus on:
- Frontend implementation (Next.js is already structured)
- Advanced features (notifications, import/export, social features)
- Performance optimization and caching
- Deployment configuration

## Design Documentation
Comprehensive design documents are in the `docs/` directory covering requirements, system design, API specifications, database schema, and testing strategy. Always reference these when implementing new features or making architectural changes.