using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.Books;

public class UpdateBookStatusDto
{
    [Required(ErrorMessage = "ステータスは必須です")]
    public string Status { get; set; } = string.Empty;

    public bool IsValidStatus()
    {
        return Status is "unread" or "reading" or "completed";
    }
}