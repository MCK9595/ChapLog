using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.Entities;

public class Book
{
    public Book()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Author { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Publisher { get; set; }

    public int? PublicationYear { get; set; }
    public int? TotalPages { get; set; }

    [MaxLength(100)]
    public string? Genre { get; set; }

    public string? CoverImageUrl { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "unread";

    public string? Notes { get; set; }
    public int CurrentPage { get; set; } = 0;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<ReadingEntry> ReadingEntries { get; set; } = new List<ReadingEntry>();
    public virtual BookReview? BookReview { get; set; }
}