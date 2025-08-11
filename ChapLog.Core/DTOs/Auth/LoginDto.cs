using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.Auth;

public class LoginDto
{
    [Required(ErrorMessage = "メールアドレスは必須です")]
    [EmailAddress(ErrorMessage = "有効なメールアドレスを入力してください")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "パスワードは必須です")]
    public string Password { get; set; } = string.Empty;
}