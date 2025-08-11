namespace ChapLog.Core.DTOs.BookReviews;

public class BookReviewDto
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
}