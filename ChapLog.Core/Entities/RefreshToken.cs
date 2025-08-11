using System.ComponentModel.DataAnnotations;

namespace ChapLog.Core.Entities;

public class RefreshToken
{
    public RefreshToken()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(256)]
    public string Token { get; set; } = string.Empty;

    [Required]
    public DateTime ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    [MaxLength(45)]
    public string? CreatedByIp { get; set; }

    public DateTime? RevokedAt { get; set; }

    [MaxLength(45)]
    public string? RevokedByIp { get; set; }

    [MaxLength(256)]
    public string? ReplacedByToken { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsRevoked => RevokedAt != null;
    public bool IsActive => !IsRevoked && !IsExpired;

    // Navigation properties
    public virtual User User { get; set; } = null!;
}