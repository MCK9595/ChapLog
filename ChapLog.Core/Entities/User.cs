using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.Entities;

public class User
{
    public User()
    {
        Id = Guid.NewGuid();
        SecurityStamp = Guid.NewGuid().ToString();
        ConcurrencyStamp = Guid.NewGuid().ToString();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }

    [Required]
    [MaxLength(256)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string NormalizedEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string NormalizedUserName { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? SecurityStamp { get; set; }

    [MaxLength(256)]
    public string? ConcurrencyStamp { get; set; }

    public bool EmailConfirmed { get; set; } = false;
    public bool LockoutEnabled { get; set; } = true;
    public DateTime? LockoutEnd { get; set; }
    public int AccessFailedCount { get; set; } = 0;

    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = "User";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
    public virtual ICollection<ReadingEntry> ReadingEntries { get; set; } = new List<ReadingEntry>();
    public virtual ICollection<BookReview> BookReviews { get; set; } = new List<BookReview>();
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}