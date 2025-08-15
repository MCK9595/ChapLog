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
    .WaitFor(chaplogdb);

// API Service - depends on migration service completion
var apiService = builder.AddProject<Projects.ChapLog_Api>("api")
    .WithReference(chaplogdb)
    .WaitFor(migrationService);

// Frontend - Next.js application
builder.AddNpmApp("frontend", "../chaplog-frontend", "dev")
    .WithReference(apiService)
    .WithEnvironment("BROWSER", "none")
    .WithEnvironment("NODE_TLS_REJECT_UNAUTHORIZED", "0")
    .WithEnvironment("NEXT_PUBLIC_API_BASE_URL", apiService.GetEndpoint("http"))
    .WaitFor(apiService)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();
