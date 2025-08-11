using ChapLog.Core.Entities;

namespace ChapLog.Core.Interfaces.Repositories;

public interface IReadingEntryRepository : IGenericRepository<ReadingEntry>
{
    Task<IEnumerable<ReadingEntry>> GetByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReadingEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<ReadingEntry>> GetByDateRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default);
    
    // ページング対応
    Task<(IEnumerable<ReadingEntry> Items, int TotalCount)> GetPagedByBookIdAsync(
        Guid bookId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);
    
    Task<(IEnumerable<ReadingEntry> Items, int TotalCount)> GetPagedByUserIdAsync(
        Guid userId,
        int page,
        int pageSize,
        string? sortBy = null,
        string? searchQuery = null,
        CancellationToken cancellationToken = default);
    
    // 統計用
    Task<int> GetEntriesCountByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);
    Task<ReadingEntry?> GetLatestEntryAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ReadingEntry?> GetLatestEntryByBookAsync(Guid bookId, CancellationToken cancellationToken = default);
    Task<int> GetReadingStreakAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<double> GetAverageRatingAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetTotalPagesReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetPagesReadByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);
    Task<int> GetPagesReadByYearAsync(Guid userId, int year, CancellationToken cancellationToken = default);
}