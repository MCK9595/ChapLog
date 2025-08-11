using ChapLog.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ChapLog.Infrastructure.Data;

public class ChapLogDbContext : DbContext
{
    public ChapLogDbContext(DbContextOptions<ChapLogDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<ReadingEntry> ReadingEntries => Set<ReadingEntry>();
    public DbSet<BookReview> BookReviews => Set<BookReview>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUserEntity(modelBuilder);
        ConfigureBookEntity(modelBuilder);
        ConfigureReadingEntryEntity(modelBuilder);
        ConfigureBookReviewEntity(modelBuilder);
        ConfigureRefreshTokenEntity(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entities = ChangeTracker.Entries()
            .Where(x => x.State == EntityState.Added || x.State == EntityState.Modified);

        foreach (var entity in entities)
        {
            if (entity.State == EntityState.Added)
            {
                try
                {
                    var createdAtProperty = entity.Property("CreatedAt");
                    createdAtProperty.CurrentValue = DateTime.UtcNow;
                }
                catch (InvalidOperationException)
                {
                    // Entity doesn't have CreatedAt property, skip
                }
            }

            // Only update UpdatedAt for entities that have this property (RefreshToken doesn't have it)
            try
            {
                var updatedAtProperty = entity.Property("UpdatedAt");
                updatedAtProperty.CurrentValue = DateTime.UtcNow;
            }
            catch (InvalidOperationException)
            {
                // Entity doesn't have UpdatedAt property, skip
            }
        }
    }

    private static void ConfigureUserEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.NormalizedEmail)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.UserName)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.NormalizedUserName)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.PasswordHash)
                .IsRequired();

            entity.Property(e => e.SecurityStamp)
                .HasMaxLength(256);

            entity.Property(e => e.ConcurrencyStamp)
                .HasMaxLength(256);

            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("User");

            entity.Property(e => e.EmailConfirmed)
                .HasDefaultValue(false);

            entity.Property(e => e.LockoutEnabled)
                .HasDefaultValue(true);

            entity.Property(e => e.AccessFailedCount)
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                
            entity.Property(e => e.LastLoginAt);

            // インデックス
            entity.HasIndex(e => e.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");

            entity.HasIndex(e => e.NormalizedEmail)
                .IsUnique()
                .HasDatabaseName("IX_Users_NormalizedEmail");

            entity.HasIndex(e => e.NormalizedUserName)
                .HasDatabaseName("IX_Users_NormalizedUserName");

            // 制約
            entity.ToTable(t => t.HasCheckConstraint("CK_Users_Role", 
                "\"Role\" IN ('User', 'Admin')"));
        });
    }

    private static void ConfigureBookEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.Author)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(e => e.Publisher)
                .HasMaxLength(256);

            entity.Property(e => e.Genre)
                .HasMaxLength(100);

            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("unread");

            entity.Property(e => e.CurrentPage)
                .HasDefaultValue(0);

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // リレーションシップ
            entity.HasOne(e => e.User)
                .WithMany(e => e.Books)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // インデックス
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Books_UserId");

            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Books_Status");

            entity.HasIndex(e => e.CreatedAt)
                .HasDatabaseName("IX_Books_CreatedAt");

            entity.HasIndex(e => new { e.Title, e.Author })
                .HasDatabaseName("IX_Books_Title_Author");

            entity.HasIndex(e => new { e.UserId, e.Status })
                .HasDatabaseName("IX_Books_UserId_Status")
                .IncludeProperties(e => new { e.TotalPages, e.CurrentPage });

            // 制約
            entity.ToTable(t => 
            {
                t.HasCheckConstraint("CK_Books_Status", 
                    "\"Status\" IN ('unread', 'reading', 'completed')");
                t.HasCheckConstraint("CK_Books_CurrentPage", 
                    "\"CurrentPage\" >= 0");
                t.HasCheckConstraint("CK_Books_TotalPages", 
                    "\"TotalPages\" IS NULL OR \"TotalPages\" > 0");
            });
        });
    }

    private static void ConfigureReadingEntryEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ReadingEntry>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.BookId)
                .IsRequired();

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.ReadingDate)
                .IsRequired();

            entity.Property(e => e.StartPage)
                .IsRequired();

            entity.Property(e => e.EndPage)
                .IsRequired();

            entity.Property(e => e.Chapter)
                .HasMaxLength(256);

            entity.Property(e => e.Rating)
                .IsRequired();

            // JSON列の設定（PostgreSQL JSONB）
            entity.Property(e => e.Learnings)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasDefaultValue(new List<string>())
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // リレーションシップ
            entity.HasOne(e => e.Book)
                .WithMany(e => e.ReadingEntries)
                .HasForeignKey(e => e.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(e => e.ReadingEntries)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // インデックス
            entity.HasIndex(e => e.BookId)
                .HasDatabaseName("IX_ReadingEntries_BookId");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_ReadingEntries_UserId");

            entity.HasIndex(e => e.ReadingDate)
                .HasDatabaseName("IX_ReadingEntries_ReadingDate");

            entity.HasIndex(e => new { e.BookId, e.ReadingDate })
                .HasDatabaseName("IX_ReadingEntries_BookId_ReadingDate");

            // 制約
            entity.ToTable(t => 
            {
                t.HasCheckConstraint("CK_ReadingEntries_Rating", 
                    "\"Rating\" BETWEEN 1 AND 5");
                t.HasCheckConstraint("CK_ReadingEntries_Pages", 
                    "\"StartPage\" <= \"EndPage\" AND \"StartPage\" > 0");
            });
        });
    }

    private static void ConfigureBookReviewEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BookReview>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.BookId)
                .IsRequired();

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.CompletedDate)
                .IsRequired();

            entity.Property(e => e.OverallImpression)
                .IsRequired();

            entity.Property(e => e.OverallRating)
                .IsRequired();

            entity.Property(e => e.RecommendationLevel)
                .IsRequired();

            // JSON列の設定（PostgreSQL JSONB）
            entity.Property(e => e.KeyLearnings)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .HasDefaultValue(new List<string>())
                .Metadata.SetValueComparer(new Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.UpdatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            // リレーションシップ
            entity.HasOne(e => e.Book)
                .WithOne(e => e.BookReview)
                .HasForeignKey<BookReview>(e => e.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(e => e.BookReviews)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // インデックス
            entity.HasIndex(e => e.BookId)
                .IsUnique()
                .HasDatabaseName("IX_BookReviews_BookId");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_BookReviews_UserId");

            // 制約
            entity.ToTable(t => 
            {
                t.HasCheckConstraint("CK_BookReviews_OverallRating", 
                    "\"OverallRating\" BETWEEN 1 AND 5");
                t.HasCheckConstraint("CK_BookReviews_RecommendationLevel", 
                    "\"RecommendationLevel\" BETWEEN 1 AND 5");
            });
        });
    }

    private static void ConfigureRefreshTokenEntity(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.Token)
                .IsRequired()
                .HasMaxLength(256);

            entity.Property(e => e.ExpiresAt)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            entity.Property(e => e.CreatedByIp)
                .HasMaxLength(45);

            entity.Property(e => e.RevokedByIp)
                .HasMaxLength(45);

            entity.Property(e => e.ReplacedByToken)
                .HasMaxLength(256);

            // リレーションシップ
            entity.HasOne(e => e.User)
                .WithMany(e => e.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // インデックス
            entity.HasIndex(e => e.Token)
                .IsUnique()
                .HasDatabaseName("IX_RefreshTokens_Token");

            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_RefreshTokens_UserId");

            entity.HasIndex(e => e.ExpiresAt)
                .HasDatabaseName("IX_RefreshTokens_ExpiresAt");
        });
    }
}