using ChapLog.Core.DTOs.Auth;
using ChapLog.Core.DTOs.Common;

namespace ChapLog.Core.Interfaces.Services;

public interface IAdminService
{
    Task<PagedResult<UserDto>> GetUsersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);
    
    Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default);
}