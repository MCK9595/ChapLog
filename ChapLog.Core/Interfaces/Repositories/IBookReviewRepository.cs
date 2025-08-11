using ChapLog.Core.Entities;

namespace ChapLog.Core.Interfaces.Repositories;

public interface IBookReviewRepository : IGenericRepository<BookReview>
{
    Task<BookReview?> GetByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookReview>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default);
    
    // 統計用
    Task<double> GetAverageRatingAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetReviewsCountByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);
    Task<int> GetReviewsCountByYearAsync(Guid userId, int year, CancellationToken cancellationToken = default);
}