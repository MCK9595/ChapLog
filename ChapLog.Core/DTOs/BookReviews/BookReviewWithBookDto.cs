namespace ChapLog.Core.DTOs.BookReviews;

public class BookReviewWithBookDto
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public DateOnly CompletedDate { get; set; }
    public string OverallImpression { get; set; } = string.Empty;
    public List<string> KeyLearnings { get; set; } = new();
    public int OverallRating { get; set; }
    public int RecommendationLevel { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Book information
    public string BookTitle { get; set; } = string.Empty;
    public string BookAuthor { get; set; } = string.Empty;
    public string BookGenre { get; set; } = string.Empty;
    public int BookTotalPages { get; set; }
    public string? BookImageUrl { get; set; }
}