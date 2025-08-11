using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.Infrastructure.Repositories;

public class ReadingEntryRepository : GenericRepository<ReadingEntry>, IReadingEntryRepository
{
    public ReadingEntryRepository(ChapLogDbContext context) : base(context)
    {
    }

    // Override to include Book navigation property
    public override async Task<ReadingEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(re => re.Book)
            .FirstOrDefaultAsync(re => re.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<ReadingEntry>> GetByBookIdAsync(Guid bookId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.BookId == bookId)
            .OrderByDescending(re => re.ReadingDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReadingEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId)
            .OrderByDescending(re => re.ReadingDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ReadingEntry>> GetByDateRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId && 
                        re.ReadingDate >= startDate && 
                        re.ReadingDate <= endDate)
            .OrderByDescending(re => re.ReadingDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IEnumerable<ReadingEntry> Items, int TotalCount)> GetPagedByBookIdAsync(
        Guid bookId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(re => re.BookId == bookId);
        
        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(re => re.ReadingDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IEnumerable<ReadingEntry> Items, int TotalCount)> GetPagedByUserIdAsync(
        Guid userId,
        int page,
        int pageSize,
        string? sortBy = null,
        string? searchQuery = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(re => re.Book)
            .Where(re => re.UserId == userId);

        // Search functionality
        if (!string.IsNullOrEmpty(searchQuery))
        {
            var lowerQuery = searchQuery.ToLower();
            query = query.Where(re => 
                re.Book.Title.ToLower().Contains(lowerQuery) ||
                (re.Impression != null && re.Impression.ToLower().Contains(lowerQuery)) ||
                (re.Notes != null && re.Notes.ToLower().Contains(lowerQuery)));
        }

        // Sorting
        query = sortBy switch
        {
            "date-asc" => query.OrderBy(re => re.ReadingDate),
            "rating-desc" => query.OrderByDescending(re => re.Rating),
            "rating-asc" => query.OrderBy(re => re.Rating),
            "pages-desc" => query.OrderByDescending(re => re.EndPage - re.StartPage),
            _ => query.OrderByDescending(re => re.ReadingDate) // date-desc default
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> GetEntriesCountByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await _dbSet.CountAsync(re => 
            re.UserId == userId && 
            re.ReadingDate.Year == year && 
            re.ReadingDate.Month == month, 
            cancellationToken);
    }

    public async Task<ReadingEntry?> GetLatestEntryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId)
            .OrderByDescending(re => re.ReadingDate)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ReadingEntry?> GetLatestEntryByBookAsync(Guid bookId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.BookId == bookId)
            .OrderByDescending(re => re.ReadingDate)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<int> GetReadingStreakAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var entries = await _dbSet
            .Where(re => re.UserId == userId)
            .Select(re => re.ReadingDate)
            .Distinct()
            .OrderByDescending(date => date)
            .ToListAsync(cancellationToken);

        if (!entries.Any())
            return 0;

        int streak = 0;
        var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var entryDate in entries)
        {
            if (entryDate == currentDate || entryDate == currentDate.AddDays(-1))
            {
                streak++;
                currentDate = entryDate.AddDays(-1);
            }
            else
            {
                break;
            }
        }

        return streak;
    }

    public async Task<double> GetAverageRatingAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var hasEntries = await _dbSet.AnyAsync(re => re.UserId == userId, cancellationToken);
        
        if (!hasEntries)
            return 0.0;

        var averageRating = await _dbSet
            .Where(re => re.UserId == userId)
            .AverageAsync(re => (double)re.Rating, cancellationToken);

        return Math.Round(averageRating, 2);
    }

    public async Task<int> GetTotalPagesReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId)
            .SumAsync(re => re.EndPage - re.StartPage + 1, cancellationToken);
    }

    public async Task<int> GetPagesReadByMonthAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId && 
                        re.ReadingDate.Year == year && 
                        re.ReadingDate.Month == month)
            .SumAsync(re => re.EndPage - re.StartPage + 1, cancellationToken);
    }

    public async Task<int> GetPagesReadByYearAsync(Guid userId, int year, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(re => re.UserId == userId && re.ReadingDate.Year == year)
            .SumAsync(re => re.EndPage - re.StartPage + 1, cancellationToken);
    }
}