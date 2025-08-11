using Aspire.Hosting;

var builder = DistributedApplication.CreateBuilder(args);

// PostgreSQL database
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var chaplogdb = postgres.AddDatabase("chaplogdb");

// Migration Service - runs first to set up the database
var migrationService = builder.AddProject<Projects.ChapLog_MigrationService>("migration-service")
    .WithReference(chaplogdb)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", builder.Environment.EnvironmentName)
    .WaitFor(chaplogdb);

// API Service - depends on migration service completion
var apiService = builder.AddProject<Projects.ChapLog_Api>("api")
    .WithReference(chaplogdb)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", builder.Environment.EnvironmentName)
    .WaitFor(migrationService);

// Frontend - Next.js application
var frontend = builder.AddNpmApp("frontend", "../chaplog-frontend", "dev")
    .WithReference(apiService)
    .WaitFor(apiService)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
