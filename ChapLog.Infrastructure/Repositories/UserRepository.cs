using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ChapLogDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByNormalizedEmailAsync(string normalizedEmail, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail, cancellationToken);
    }

    public async Task<User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName, cancellationToken);
    }

    public async Task<User?> GetByNormalizedUserNameAsync(string normalizedUserName, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.NormalizedUserName == normalizedUserName, cancellationToken);
    }

    public async Task<bool> IsEmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<bool> IsUserNameExistsAsync(string userName, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(u => u.UserName == userName, cancellationToken);
    }

    public async Task<int> GetTotalUsersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(cancellationToken);
    }

    public async Task<IEnumerable<User>> GetUsersWithRoleAsync(string role, CancellationToken cancellationToken = default)
    {
        return await _dbSet.Where(u => u.Role == role).ToListAsync(cancellationToken);
    }
}