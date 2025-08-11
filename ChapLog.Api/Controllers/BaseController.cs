using ChapLog.Core.DTOs.Common;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ChapLog.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected Guid GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(userId, out var parsedUserId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return parsedUserId;
    }

    protected bool IsAdmin()
    {
        return User.IsInRole("Admin");
    }

    protected string? GetCurrentUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value;
    }

    protected ActionResult<ApiResponse<T>> Success<T>(T data, string message = "Success")
    {
        return Ok(new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        });
    }

    protected ActionResult<ApiResponse<object>> Success(string message = "Success")
    {
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = message,
            Data = null
        });
    }

    protected ActionResult<ApiResponse<object>> Error(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new ApiResponse<object>
        {
            Success = false,
            Message = message,
            Data = null
        });
    }

    protected ActionResult<ApiResponse<T>> Error<T>(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default
        });
    }
}