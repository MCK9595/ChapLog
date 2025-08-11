using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.DTOs.Auth;

public class RefreshTokenDto
{
    [Required(ErrorMessage = "リフレッシュトークンは必須です")]
    public string RefreshToken { get; set; } = string.Empty;
}