using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.Entities;

public class ReadingEntry
{
    public ReadingEntry()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public Guid UserId { get; set; }

    [Required]
    public DateOnly ReadingDate { get; set; }

    [Required]
    public int StartPage { get; set; }

    [Required]
    public int EndPage { get; set; }

    [MaxLength(256)]
    public string? Chapter { get; set; }

    public string? Notes { get; set; }

    public string? Impression { get; set; }

    /// <summary>
    /// 学び・気づき（JSON配列として保存）
    /// </summary>
    public List<string> Learnings { get; set; } = new();

    [Range(1, 5)]
    public int Rating { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public virtual Book Book { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}