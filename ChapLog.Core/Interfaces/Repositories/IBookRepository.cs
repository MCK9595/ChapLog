using ChapLog.Core.Entities;

namespace ChapLog.Core.Interfaces.Repositories;

public interface IBookRepository : IGenericRepository<Book>
{
    Task<IEnumerable<Book>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Book>> GetByStatusAsync(Guid userId, string status, CancellationToken cancellationToken = default);
    Task<IEnumerable<Book>> SearchAsync(Guid userId, string searchTerm, CancellationToken cancellationToken = default);
    
    // ページング対応の検索・フィルタリング
    Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedWithFiltersAsync(
        Guid userId,
        int page,
        int pageSize,
        string? status = null,
        string? searchTerm = null,
        string sortBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default);
    
    // 統計用
    Task<int> GetBooksCountByStatusAsync(Guid userId, string status, CancellationToken cancellationToken = default);
    Task<int> GetTotalPagesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetReadPagesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<string>> GetGenresAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<string?> GetMostReadGenreAsync(Guid userId, CancellationToken cancellationToken = default);
}