using ChapLog.Core.DTOs.Auth;
using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;

namespace ChapLog.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting user registration for email: {Email}, userName: {UserName}", 
            registerDto.Email, registerDto.UserName);

        _logger.LogInformation("Checking if email exists: {Email}", registerDto.Email);
        if (await _userRepository.IsEmailExistsAsync(registerDto.Email, cancellationToken))
        {
            _logger.LogWarning("Registration failed: Email already exists: {Email}", registerDto.Email);
            throw new InvalidOperationException("Email is already registered");
        }

        // Username uniqueness check removed - multiple users can have the same username

        _logger.LogInformation("Creating new user entity");
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = registerDto.Email,
            NormalizedEmail = registerDto.Email.ToUpperInvariant(),
            UserName = registerDto.UserName,
            NormalizedUserName = registerDto.UserName.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
            Role = "User",
            EmailConfirmed = false,
            LockoutEnabled = true,
            AccessFailedCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _logger.LogInformation("Saving user to database: {UserId}", user.Id);
        await _userRepository.CreateAsync(user, cancellationToken);

        _logger.LogInformation("Generating JWT token for user: {UserId}", user.Id);
        var jwtToken = GenerateJwtToken(user);
        
        _logger.LogInformation("Generating refresh token for user: {UserId}", user.Id);
        var refreshToken = await GenerateRefreshTokenAsync(user.Id, null, cancellationToken);

        _logger.LogInformation("User registration completed successfully: {UserId}, {Email}", user.Id, user.Email);
        return new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = refreshToken.Token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Role = user.Role,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(loginDto.Email, cancellationToken);
        
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Account is locked out");
        }

        user.AccessFailedCount = 0;
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        var jwtToken = GenerateJwtToken(user);
        var refreshToken = await GenerateRefreshTokenAsync(user.Id, ipAddress, cancellationToken);

        return new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = refreshToken.Token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Role = user.Role,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken, cancellationToken);
        
        if (token == null || !token.IsActive)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var newRefreshToken = await RotateRefreshTokenAsync(token, ipAddress, cancellationToken);
        var user = token.User!;
        var jwtToken = GenerateJwtToken(user);

        return new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = newRefreshToken.Token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Role = user.Role,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            }
        };
    }

    public async Task RevokeTokenAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken, cancellationToken);
        
        if (token == null || !token.IsActive)
        {
            throw new ArgumentException("Invalid refresh token");
        }

        await _refreshTokenRepository.RevokeTokenAsync(refreshToken, ipAddress, null, cancellationToken);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            Role = user.Role,
            EmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        
        if (user == null)
            return null;

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            UserName = user.UserName,
            Role = user.Role,
            EmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> ValidateUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _userRepository.ExistsAsync(u => u.Id == userId, cancellationToken);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var key = Encoding.UTF8.GetBytes(jwtKey);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["JWT:Issuer"],
            audience: _configuration["JWT:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["JWT:ExpiryInMinutes"] ?? "60")),
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> GenerateRefreshTokenAsync(Guid userId, string? ipAddress, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting refresh token generation for user: {UserId}", userId);
        
        using var rng = RandomNumberGenerator.Create();
        var randomBytes = new byte[64];
        rng.GetBytes(randomBytes);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = Convert.ToBase64String(randomBytes),
            ExpiresAt = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JWT:RefreshTokenExpiryInDays"] ?? "7")),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        _logger.LogInformation("Saving refresh token to database: {TokenId}", refreshToken.Id);
        try
        {
            var result = await _refreshTokenRepository.CreateAsync(refreshToken, cancellationToken);
            _logger.LogInformation("Refresh token created successfully: {TokenId}", result.Id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create refresh token for user: {UserId}", userId);
            throw;
        }
    }

    private async Task<RefreshToken> RotateRefreshTokenAsync(RefreshToken refreshToken, string? ipAddress, CancellationToken cancellationToken)
    {
        var newRefreshToken = await GenerateRefreshTokenAsync(refreshToken.UserId, ipAddress, cancellationToken);
        
        await _refreshTokenRepository.RevokeTokenAsync(
            refreshToken.Token, 
            ipAddress, 
            newRefreshToken.Token, 
            cancellationToken);

        return newRefreshToken;
    }
}