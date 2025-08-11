using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "メールアドレスは必須です")]
    [EmailAddress(ErrorMessage = "有効なメールアドレスを入力してください")]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "パスワードは必須です")]
    [MinLength(8, ErrorMessage = "パスワードは8文字以上で入力してください")]
    public string Password { get; set; } = string.Empty;


    [Required(ErrorMessage = "ユーザー名は必須です")]
    [MaxLength(256)]
    public string UserName { get; set; } = string.Empty;
}