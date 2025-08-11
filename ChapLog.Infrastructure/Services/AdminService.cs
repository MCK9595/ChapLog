using ChapLog.Core.DTOs.Auth;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;

namespace ChapLog.Infrastructure.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;

    public AdminService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(
        int page = 1,
        int pageSize = 20,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _userRepository.GetPagedAsync(
            page,
            pageSize,
            predicate: !string.IsNullOrEmpty(searchTerm) 
                ? u => u.Email.Contains(searchTerm) || u.UserName.Contains(searchTerm)
                : null,
            orderBy: u => u.CreatedAt,
            ascending: false,
            cancellationToken);

        var userDtos = result.Items.Select(MapToDto).ToList();

        return new PagedResult<UserDto>
        {
            Items = userDtos,
            TotalCount = result.TotalCount,
            CurrentPage = page,
            PageSize = pageSize,
            PageCount = (int)Math.Ceiling((double)result.TotalCount / pageSize)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
            return null;

        return MapToDto(user);
    }

    public async Task DeleteUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        
        if (user == null)
        {
            throw new ArgumentException("User not found");
        }

        if (user.Role == "Admin")
        {
            throw new InvalidOperationException("Cannot delete admin user");
        }

        await _userRepository.DeleteAsync(user, cancellationToken);
    }

    public async Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _userRepository.GetTotalUsersCountAsync(cancellationToken);
    }

    private static UserDto MapToDto(Core.Entities.User user)
    {
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
}