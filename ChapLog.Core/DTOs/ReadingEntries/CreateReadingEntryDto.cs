using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.ReadingEntries;

public class CreateReadingEntryDto
{
    [Required(ErrorMessage = "読書日は必須です")]
    public DateOnly ReadingDate { get; set; }

    [Required(ErrorMessage = "開始ページは必須です")]
    [Range(1, int.MaxValue, ErrorMessage = "開始ページは1以上で入力してください")]
    public int StartPage { get; set; }

    [Required(ErrorMessage = "終了ページは必須です")]
    [Range(1, int.MaxValue, ErrorMessage = "終了ページは1以上で入力してください")]
    public int EndPage { get; set; }

    [MaxLength(256, ErrorMessage = "章・セクションは256文字以内で入力してください")]
    public string? Chapter { get; set; }

    public string? Notes { get; set; }

    public string? Impression { get; set; }

    public List<string> Learnings { get; set; } = new();

    [Required(ErrorMessage = "評価は必須です")]
    [Range(1, 5, ErrorMessage = "評価は1から5の間で入力してください")]
    public int Rating { get; set; }

    public bool IsValidPageRange()
    {
        return StartPage <= EndPage;
    }
}