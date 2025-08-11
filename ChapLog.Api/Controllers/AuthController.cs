using ChapLog.Core.DTOs.Auth;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto registerDto, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Register endpoint called with email: {Email}, userName: {UserName}", 
            registerDto?.Email, registerDto?.UserName);
        
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state: {ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Attempting to register user: {Email}", registerDto.Email);
            var result = await _authService.RegisterAsync(registerDto, cancellationToken);
            return Success(result, "User registered successfully");
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Registration failed due to business logic: {Message}", ex.Message);
            return Error<AuthResponseDto>(ex.Message, 409);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during registration for email: {Email}", registerDto?.Email);
            return Error<AuthResponseDto>($"Registration failed: {ex.Message}", 500);
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.LoginAsync(loginDto, ipAddress, cancellationToken);
            return Success(result, "Login successful");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Error<AuthResponseDto>(ex.Message, 401);
        }
        catch (Exception ex)
        {
            return Error<AuthResponseDto>($"Login failed: {ex.Message}", 500);
        }
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> RefreshToken([FromBody] RefreshTokenDto refreshTokenDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken, ipAddress, cancellationToken);
            return Success(result, "Token refreshed successfully");
        }
        catch (UnauthorizedAccessException ex)
        {
            return Error<AuthResponseDto>(ex.Message, 401);
        }
        catch (Exception ex)
        {
            return Error<AuthResponseDto>($"Token refresh failed: {ex.Message}", 500);
        }
    }

    [HttpPost("revoke-token")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> RevokeToken([FromBody] RefreshTokenDto refreshTokenDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _authService.RevokeTokenAsync(refreshTokenDto.RefreshToken, ipAddress, cancellationToken);
            return Success("Token revoked successfully");
        }
        catch (ArgumentException ex)
        {
            return Error(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error($"Token revocation failed: {ex.Message}", 500);
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetCurrentUser(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var user = await _authService.GetUserByIdAsync(userId, cancellationToken);
            
            if (user == null)
            {
                return Error<UserDto>("User not found", 404);
            }

            return Success(user, "User information retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<UserDto>($"Failed to get user information: {ex.Message}", 500);
        }
    }

    [HttpGet("validate")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> ValidateUser(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isValid = await _authService.ValidateUserAsync(userId, cancellationToken);
            
            if (!isValid)
            {
                return Error("User validation failed", 401);
            }

            return Success("User is valid");
        }
        catch (Exception ex)
        {
            return Error($"Validation failed: {ex.Message}", 500);
        }
    }
}