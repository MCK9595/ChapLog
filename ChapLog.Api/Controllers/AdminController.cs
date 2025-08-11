using ChapLog.Core.DTOs.Auth;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class AdminController : BaseController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _adminService.GetUsersAsync(page, pageSize, searchTerm, cancellationToken);
            return Success(result, "Users retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<PagedResult<UserDto>>($"Failed to retrieve users: {ex.Message}", 500);
        }
    }

    [HttpGet("users/{userId}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _adminService.GetUserByIdAsync(userId, cancellationToken);
            
            if (user == null)
            {
                return Error<UserDto>("User not found", 404);
            }

            return Success(user, "User retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<UserDto>($"Failed to retrieve user: {ex.Message}", 500);
        }
    }

    [HttpDelete("users/{userId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteUser(Guid userId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminService.DeleteUserAsync(userId, cancellationToken);
            return Success("User deleted successfully");
        }
        catch (ArgumentException ex)
        {
            return Error(ex.Message, 400);
        }
        catch (InvalidOperationException ex)
        {
            return Error(ex.Message, 403);
        }
        catch (Exception ex)
        {
            return Error($"Failed to delete user: {ex.Message}", 500);
        }
    }

    [HttpGet("users/count")]
    public async Task<ActionResult<ApiResponse<object>>> GetTotalUsersCount(CancellationToken cancellationToken)
    {
        try
        {
            var count = await _adminService.GetTotalUsersCountAsync(cancellationToken);
            return Success((object)new { totalUsers = count }, "Total users count retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error($"Failed to retrieve users count: {ex.Message}", 500);
        }
    }
}