using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.Entities;

public class BookReview
{
    public BookReview()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }

    [Required]
    public Guid BookId { get; set; }

    public Guid UserId { get; set; }

    [Required]
    public DateOnly CompletedDate { get; set; }

    [Required]
    public string OverallImpression { get; set; } = string.Empty;

    /// <summary>
    /// 主な学び（JSON配列として保存）
    /// </summary>
    public List<string> KeyLearnings { get; set; } = new();

    [Range(1, 5)]
    public int OverallRating { get; set; }

    [Range(1, 5)]
    public int RecommendationLevel { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Book Book { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}