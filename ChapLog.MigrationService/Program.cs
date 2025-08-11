using ChapLog.MigrationService;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

// Add service defaults & Aspire components.
builder.AddServiceDefaults();

// Add database context with Aspire PostgreSQL integration
builder.AddNpgsqlDbContext<ChapLogDbContext>("chaplogdb");

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
