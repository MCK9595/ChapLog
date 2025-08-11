using ChapLog.Core.Entities;

namespace ChapLog.Core.Interfaces.Repositories;

public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default);
    Task<User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken = default);
    Task<User?> GetByNormalizedUserNameAsync(string normalizedUserName, CancellationToken cancellationToken = default);
    Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> IsUserNameExistsAsync(string userName, CancellationToken cancellationToken = default);
    Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<User>> GetUsersWithRoleAsync(string role, CancellationToken cancellationToken = default);
}