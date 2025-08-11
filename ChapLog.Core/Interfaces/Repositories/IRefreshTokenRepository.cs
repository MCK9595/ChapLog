using ChapLog.Core.Entities;

namespace ChapLog.Core.Interfaces.Repositories;

public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
{
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<IEnumerable<RefreshToken>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<RefreshToken>> GetActiveTokensByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task RevokeTokenAsync(string token, string? revokedByIp = null, string? replacedByToken = null, CancellationToken cancellationToken = default);
    Task RevokeAllUserTokensAsync(Guid userId, string? revokedByIp = null, CancellationToken cancellationToken = default);
    Task CleanupExpiredTokensAsync(CancellationToken cancellationToken = default);
}