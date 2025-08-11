namespace ChapLog.Core.DTOs.Statistics;

public class UserActivityDto
{
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty; // book_added, book_updated, entry_added, review_added
    public string Description { get; set; } = string.Empty;
    public string? BookTitle { get; set; }
    public Guid? BookId { get; set; }
    public int? PagesRead { get; set; }
    public string? Chapter { get; set; }
    public int? Rating { get; set; }
}