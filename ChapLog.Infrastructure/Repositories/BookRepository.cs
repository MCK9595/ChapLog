using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ChapLog.Infrastructure.Repositories;

public class BookRepository : GenericRepository<Book>, IBookRepository
{
    public BookRepository(ChapLogDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Book>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Book>> GetByStatusAsync(Guid userId, string status, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && b.Status == status)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Book>> SearchAsync(Guid userId, string searchTerm, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && 
                       (b.Title.Contains(searchTerm) || 
                        b.Author.Contains(searchTerm) ||
                        (b.Publisher != null && b.Publisher.Contains(searchTerm)) ||
                        (b.Genre != null && b.Genre.Contains(searchTerm))))
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<Book> Items, int TotalCount)> GetPagedWithFiltersAsync(
        Guid userId,
        int page,
        int pageSize,
        string? status = null,
        string? searchTerm = null,
        string sortBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(b => b.UserId == userId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(b => b.Status == status);

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(b => 
                b.Title.Contains(searchTerm) || 
                b.Author.Contains(searchTerm) ||
                (b.Publisher != null && b.Publisher.Contains(searchTerm)) ||
                (b.Genre != null && b.Genre.Contains(searchTerm)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // ソート処理
        Expression<Func<Book, object>> orderByExpression = sortBy.ToLower() switch
        {
            "title" => b => b.Title,
            "author" => b => b.Author,
            "status" => b => b.Status,
            "createdat" => b => b.CreatedAt,
            _ => b => b.CreatedAt
        };

        query = ascending ? query.OrderBy(orderByExpression) : query.OrderByDescending(orderByExpression);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> GetBooksCountByStatusAsync(Guid userId, string status, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(b => b.UserId == userId && b.Status == status, cancellationToken);
    }

    public async Task<int> GetTotalPagesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && b.TotalPages.HasValue)
            .SumAsync(b => b.TotalPages!.Value, cancellationToken);
    }

    public async Task<int> GetReadPagesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId)
            .SumAsync(b => b.CurrentPage, cancellationToken);
    }

    public async Task<IEnumerable<string>> GetGenresAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && !string.IsNullOrEmpty(b.Genre))
            .Select(b => b.Genre!)
            .Distinct()
            .OrderBy(g => g)
            .ToListAsync(cancellationToken);
    }

    public async Task<string?> GetMostReadGenreAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(b => b.UserId == userId && !string.IsNullOrEmpty(b.Genre))
            .GroupBy(b => b.Genre)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync(cancellationToken);
    }
}