using ChapLog.Core.DTOs.Auth;

namespace ChapLog.Core.Interfaces.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserDto?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ValidateUserAsync(Guid userId, CancellationToken cancellationToken = default);
}