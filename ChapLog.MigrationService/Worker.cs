using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.MigrationService;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostApplicationLifetime _appLifetime;

    public Worker(
        ILogger<Worker> logger, 
        IServiceProvider serviceProvider,
        IHostApplicationLifetime appLifetime)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _appLifetime = appLifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            _logger.LogInformation("Starting database migration service...");

            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ChapLogDbContext>();

            var migrationSuccess = await RunMigrationsWithRetryAsync(context, stoppingToken);
            
            if (migrationSuccess)
            {
                await SeedDataAsync(context, stoppingToken);
                _logger.LogInformation("Database migration and seeding completed successfully.");
            }
            else
            {
                _logger.LogError("Database migration failed after all retry attempts.");
                Environment.ExitCode = 1;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during database migration.");
            Environment.ExitCode = 1;
        }
        finally
        {
            _appLifetime.StopApplication();
        }
    }

    private async Task<bool> RunMigrationsWithRetryAsync(ChapLogDbContext context, CancellationToken cancellationToken)
    {
        const int maxRetries = 5;
        const int baseDelay = 2000; // 2 seconds

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                _logger.LogInformation("Migration attempt {Attempt}/{MaxRetries}", attempt, maxRetries);

                // Only check connection once to avoid redundant calls
                if (attempt == 1)
                {
                    await context.Database.CanConnectAsync(cancellationToken);
                    _logger.LogInformation("Database connection successful.");
                }

                // Get pending migrations
                var pendingMigrations = await context.Database.GetPendingMigrationsAsync(cancellationToken);
                
                if (pendingMigrations.Any())
                {
                    _logger.LogInformation("Found {Count} pending migrations: {Migrations}", 
                        pendingMigrations.Count(), 
                        string.Join(", ", pendingMigrations));

                    // Apply migrations
                    await context.Database.MigrateAsync(cancellationToken);
                    _logger.LogInformation("Successfully applied database migrations.");
                }
                else
                {
                    _logger.LogInformation("Database is already up to date. No migrations needed.");
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Migration attempt {Attempt} failed: {Message}", attempt, ex.Message);

                if (attempt == maxRetries)
                {
                    _logger.LogError("All migration attempts failed.");
                    return false;
                }

                // Exponential backoff
                var delay = TimeSpan.FromMilliseconds(baseDelay * Math.Pow(2, attempt - 1));
                _logger.LogInformation("Waiting {Delay}ms before retry...", delay.TotalMilliseconds);
                
                try
                {
                    await Task.Delay(delay, cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    _logger.LogInformation("Migration cancelled.");
                    return false;
                }
            }
        }

        return false;
    }

    private async Task SeedDataAsync(ChapLogDbContext context, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting data seeding...");

            // Check if any users exist
            var hasUsers = await context.Users.AnyAsync(cancellationToken);
            
            if (!hasUsers)
            {
                _logger.LogInformation("No users found. Seeding initial data...");

                // Seed admin user
                var adminUser = new ChapLog.Core.Entities.User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@chaplog.com",
                    NormalizedEmail = "ADMIN@CHAPLOG.COM",
                    UserName = "admin",
                    NormalizedUserName = "ADMIN",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    SecurityStamp = Guid.NewGuid().ToString(),
                    ConcurrencyStamp = Guid.NewGuid().ToString(),
                    Role = "Admin",
                    EmailConfirmed = true,
                    LockoutEnabled = false,
                    AccessFailedCount = 0,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Seeded admin user: {Email}", adminUser.Email);
            }
            else
            {
                _logger.LogInformation("Users already exist. Skipping data seeding.");
            }

            _logger.LogInformation("Data seeding completed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred during data seeding: {Message}", ex.Message);
            throw;
        }
    }
}
