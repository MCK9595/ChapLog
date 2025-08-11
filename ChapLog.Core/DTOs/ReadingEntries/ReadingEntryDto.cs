namespace ChapLog.Core.DTOs.ReadingEntries;

public class BookInfoDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}

public class ReadingEntryDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public BookInfoDto Book { get; set; } = new();
    public DateOnly ReadingDate { get; set; }
    public int StartPage { get; set; }
    public int EndPage { get; set; }
    public string? Chapter { get; set; }
    public string? Notes { get; set; }
    public string? Impression { get; set; }
    public List<string> Learnings { get; set; } = new();
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}