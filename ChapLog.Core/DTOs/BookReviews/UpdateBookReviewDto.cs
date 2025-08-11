using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.BookReviews;

public class UpdateBookReviewDto
{
    [Required(ErrorMessage = "読了日は必須です")]
    public DateOnly CompletedDate { get; set; }

    [Required(ErrorMessage = "全体の感想は必須です")]
    public string OverallImpression { get; set; } = string.Empty;

    public List<string> KeyLearnings { get; set; } = new();

    [Required(ErrorMessage = "総合評価は必須です")]
    [Range(1, 5, ErrorMessage = "総合評価は1から5の間で入力してください")]
    public int OverallRating { get; set; }

    [Required(ErrorMessage = "おすすめ度は必須です")]
    [Range(1, 5, ErrorMessage = "おすすめ度は1から5の間で入力してください")]
    public int RecommendationLevel { get; set; }
}