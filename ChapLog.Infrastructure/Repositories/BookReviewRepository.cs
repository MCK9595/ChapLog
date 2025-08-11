using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.Infrastructure.Repositories;

public class BookReviewRepository : GenericRepository<BookReview>, IBookReviewRepository
{
    public BookReviewRepository(ChapLogDbContext context) : base(context)
    {
    }

    public async Task<BookReview?> GetByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(br => br.BookId == bookId, cancellationToken);
    }

    public async Task<IEnumerable<BookReview>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(br => br.UserId == userId)
            .OrderByDescending(br => br.CompletedDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(br => br.BookId == bookId, cancellationToken);
    }

    public async Task<double> GetAverageRatingAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var hasReviews = await _dbSet.AnyAsync(br => br.UserId == userId, cancellationToken);
        
        if (!hasReviews)
            return 0.0;

        var averageRating = await _dbSet
            .Where(br => br.UserId == userId)
            .AverageAsync(br => (double)br.OverallRating, cancellationToken);

        return Math.Round(averageRating, 2);
    }

    public async Task<int> GetReviewsCountByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(br => 
            br.UserId == userId && 
            br.CompletedDate.Year == year && 
            br.CompletedDate.Month == month, 
            cancellationToken);
    }

    public async Task<int> GetReviewsCountByYearAsync(Guid userId, int year, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(br => 
            br.UserId == userId && 
            br.CompletedDate.Year == year, 
            cancellationToken);
    }
}