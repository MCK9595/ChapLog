using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.Books;

public class CreateBookDto
{
    [Required(ErrorMessage = "タイトルは必須です")]
    [MaxLength(500, ErrorMessage = "タイトルは500文字以内で入力してください")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "著者名は必須です")]
    [MaxLength(500, ErrorMessage = "著者名は500文字以内で入力してください")]
    public string Author { get; set; } = string.Empty;

    [MaxLength(256, ErrorMessage = "出版社名は256文字以内で入力してください")]
    public string? Publisher { get; set; }

    [Range(1000, 9999, ErrorMessage = "出版年は1000年から9999年の間で入力してください")]
    public int? PublicationYear { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ページ数は1以上で入力してください")]
    public int? TotalPages { get; set; }

    [MaxLength(100, ErrorMessage = "ジャンルは100文字以内で入力してください")]
    public string? Genre { get; set; }

    [Url(ErrorMessage = "有効なURLを入力してください")]
    public string? CoverImageUrl { get; set; }

    public string? Notes { get; set; }
}