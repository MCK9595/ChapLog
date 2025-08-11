namespace ChapLog.Core.DTOs.Books;

public class BookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Publisher { get; set; }
    public int? PublicationYear { get; set; }
    public int? TotalPages { get; set; }
    public string? Genre { get; set; }
    public string? CoverImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public int CurrentPage { get; set; }
    public int Progress { get; set; } // 進捗率（%）
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int EntryCount { get; set; } // 日記エントリ数
    public DateTime? LastEntryDate { get; set; } // 最新の日記日付
}