using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.Infrastructure.Repositories;

public class RefreshTokenRepository : GenericRepository<RefreshToken>, IRefreshTokenRepository
{
    public RefreshTokenRepository(ChapLogDbContext context) : base(context)
    {
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(rt => rt.UserId == userId)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .OrderByDescending(rt => rt.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task RevokeTokenAsync(string token, string? revokedByIp = null, string? replacedByToken = null, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _dbSet.FirstOrDefaultAsync(rt => rt.Token == token, cancellationToken);
        
        if (refreshToken != null)
        {
            refreshToken.RevokedAt = DateTime.UtcNow;
            refreshToken.RevokedByIp = revokedByIp;
            refreshToken.ReplacedByToken = replacedByToken;
            
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task RevokeAllUserTokensAsync(Guid userId, string? revokedByIp = null, CancellationToken cancellationToken = default)
    {
        var activeTokens = await _dbSet
            .Where(rt => rt.UserId == userId && rt.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = revokedByIp;
        }

        if (activeTokens.Any())
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task CleanupExpiredTokensAsync(CancellationToken cancellationToken = default)
    {
        var expiredTokens = await _dbSet
            .Where(rt => rt.ExpiresAt < DateTime.UtcNow)
            .ToListAsync(cancellationToken);

        if (expiredTokens.Any())
        {
            _dbSet.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}