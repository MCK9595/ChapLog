using ChapLog.Core.DTOs.Statistics;
using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;
using ChapLog.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ChapLog.Infrastructure.Services;

public class StatisticsService : IStatisticsService
{
    private readonly IBookRepository _bookRepository;
    private readonly IReadingEntryRepository _readingEntryRepository;
    private readonly IBookReviewRepository _bookReviewRepository;
    private readonly ChapLogDbContext _context;

    public StatisticsService(
        IBookRepository bookRepository,
        IReadingEntryRepository readingEntryRepository,
        IBookReviewRepository bookReviewRepository,
        ChapLogDbContext context)
    {
        _bookRepository = bookRepository;
        _readingEntryRepository = readingEntryRepository;
        _bookReviewRepository = bookReviewRepository;
        _context = context;
    }

    public async Task<StatisticsSummaryDto> GetSummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var currentMonth = now.Month;
        var currentYear = now.Year;
        
        // Basic book counts
        var totalBooks = await _bookRepository.CountAsync(b => b.UserId == userId, cancellationToken);
        var completedBooks = await _bookRepository.GetBooksCountByStatusAsync(userId, "completed", cancellationToken);
        var readingBooks = await _bookRepository.GetBooksCountByStatusAsync(userId, "reading", cancellationToken);
        var unreadBooks = await _bookRepository.GetBooksCountByStatusAsync(userId, "unread", cancellationToken);
        
        // Total pages read (sum of all pages read from reading entries)
        var totalPagesRead = await _readingEntryRepository.GetTotalPagesReadAsync(userId, cancellationToken);
        
        // Average rating from reading entries
        var averageRating = await _readingEntryRepository.GetAverageRatingAsync(userId, cancellationToken);
        
        // Reading streak
        var readingStreak = await _readingEntryRepository.GetReadingStreakAsync(userId, cancellationToken);
        
        // This month statistics
        var booksThisMonth = await _bookReviewRepository.GetReviewsCountByMonthAsync(userId, currentYear, currentMonth, cancellationToken);
        var pagesThisMonth = await _readingEntryRepository.GetPagesReadByMonthAsync(userId, currentYear, currentMonth, cancellationToken);
        
        // This year statistics  
        var booksThisYear = await _bookReviewRepository.GetReviewsCountByYearAsync(userId, currentYear, cancellationToken);
        var pagesThisYear = await _readingEntryRepository.GetPagesReadByYearAsync(userId, currentYear, cancellationToken);

        return new StatisticsSummaryDto
        {
            TotalBooks = totalBooks,
            CompletedBooks = completedBooks,
            ReadingBooks = readingBooks,
            UnreadBooks = unreadBooks,
            TotalPagesRead = totalPagesRead,
            AverageRating = Math.Round(averageRating, 2),
            ReadingStreak = readingStreak,
            BooksThisMonth = booksThisMonth,
            PagesThisMonth = pagesThisMonth,
            BooksThisYear = booksThisYear,
            PagesThisYear = pagesThisYear
        };
    }

    public async Task<MonthlyStatisticsDto> GetMonthlyStatisticsAsync(Guid userId, int year, CancellationToken cancellationToken = default)
    {
        var monthlyData = new List<MonthlyDataDto>();
        var monthNames = new[] { "", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月" };

        for (int month = 1; month <= 12; month++)
        {
            var entriesCount = await _readingEntryRepository.GetEntriesCountByMonthAsync(userId, year, month, cancellationToken);
            var booksCompleted = await _bookReviewRepository.GetReviewsCountByMonthAsync(userId, year, month, cancellationToken);
            var pagesRead = await _readingEntryRepository.GetPagesReadByMonthAsync(userId, year, month, cancellationToken);

            monthlyData.Add(new MonthlyDataDto
            {
                Month = monthNames[month],
                BooksCompleted = booksCompleted,
                PagesRead = pagesRead,
                EntriesCount = entriesCount
            });
        }

        var totalEntries = monthlyData.Sum(m => m.EntriesCount);
        var totalBooksCompleted = monthlyData.Sum(m => m.BooksCompleted);
        
        var mostActiveMonthIndex = monthlyData
            .Select((data, index) => new { data.EntriesCount, Index = index + 1 })
            .OrderByDescending(x => x.EntriesCount)
            .FirstOrDefault()?.Index ?? 1;

        return new MonthlyStatisticsDto
        {
            Year = year,
            MonthlyData = monthlyData,
            TotalEntries = totalEntries,
            TotalBooksCompleted = totalBooksCompleted,
            AverageEntriesPerMonth = Math.Round((double)totalEntries / 12, 1),
            MostActiveMonth = mostActiveMonthIndex
        };
    }

    public async Task<GenreStatisticsDto> GetGenreStatisticsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var genres = await _bookRepository.GetGenresAsync(userId, cancellationToken);
        var genreData = new List<GenreDataDto>();
        var totalBooksAllGenres = await _bookRepository.CountAsync(b => b.UserId == userId, cancellationToken);

        foreach (var genre in genres)
        {
            var genreBookCount = await _bookRepository.CountAsync(
                b => b.UserId == userId && b.Genre == genre, 
                cancellationToken);

            var percentage = totalBooksAllGenres > 0 ? 
                Math.Round((double)genreBookCount / totalBooksAllGenres * 100, 1) : 0;

            genreData.Add(new GenreDataDto
            {
                Genre = genre,
                Count = genreBookCount,
                Percentage = percentage
            });
        }

        genreData = genreData.OrderByDescending(g => g.Count).ToList();

        var mostReadGenre = genreData.FirstOrDefault()?.Genre;
        var highestCompletionRateGenre = genreData
            .OrderByDescending(g => g.Percentage)
            .FirstOrDefault()?.Genre;

        return new GenreStatisticsDto
        {
            GenreData = genreData,
            TotalGenres = genreData.Count,
            MostReadGenre = mostReadGenre,
            HighestCompletionRateGenre = highestCompletionRateGenre
        };
    }

    public async Task<List<UserActivityDto>> GetRecentActivitiesAsync(Guid userId, int limit = 20, CancellationToken cancellationToken = default)
    {
        var activities = new List<UserActivityDto>();

        // Get book activities (added and updated)
        var books = await _context.Books
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.UpdatedAt)
            .Take(limit * 2) // Get more to ensure we have enough after filtering
            .ToListAsync(cancellationToken);

        foreach (var book in books)
        {
            // Book added
            activities.Add(new UserActivityDto
            {
                Date = book.CreatedAt,
                Type = "book_added",
                Description = "書籍を追加しました",
                BookTitle = book.Title,
                BookId = book.Id
            });

            // Book updated (if updated after creation)
            if (book.UpdatedAt > book.CreatedAt.AddSeconds(1)) // Allow 1 second tolerance
            {
                activities.Add(new UserActivityDto
                {
                    Date = book.UpdatedAt,
                    Type = "book_updated",
                    Description = "書籍情報を更新しました",
                    BookTitle = book.Title,
                    BookId = book.Id
                });
            }
        }

        // Get reading entry activities
        var entries = await _context.ReadingEntries
            .Include(e => e.Book)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        foreach (var entry in entries)
        {
            activities.Add(new UserActivityDto
            {
                Date = entry.CreatedAt,
                Type = "entry_added",
                Description = $"{entry.EndPage}ページまで読みました",
                BookTitle = entry.Book?.Title,
                BookId = entry.BookId,
                PagesRead = entry.EndPage - entry.StartPage + 1,
                Chapter = entry.Chapter,
                Rating = entry.Rating
            });
        }

        // Get book review activities
        var reviews = await _context.BookReviews
            .Include(r => r.Book)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);

        foreach (var review in reviews)
        {
            activities.Add(new UserActivityDto
            {
                Date = review.CreatedAt,
                Type = "review_added",
                Description = "レビューを投稿しました",
                BookTitle = review.Book?.Title,
                BookId = review.BookId,
                Rating = review.OverallRating
            });
        }

        // Sort all activities by date and take the requested limit
        return activities
            .OrderByDescending(a => a.Date)
            .Take(limit)
            .ToList();
    }

    public async Task<DailyReadingHeatmapDto> GetDailyReadingHeatmapAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default)
    {
        var monthNames = new[] { "", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月" };
        
        // Get the first and last day of the month
        var firstDay = new DateOnly(year, month, 1);
        var lastDay = firstDay.AddMonths(1).AddDays(-1);
        
        // Get all reading entries for the month
        var monthlyEntries = await _context.ReadingEntries
            .Include(e => e.Book)
            .Where(e => e.UserId == userId && 
                       e.ReadingDate >= firstDay && 
                       e.ReadingDate <= lastDay)
            .ToListAsync(cancellationToken);

        // Group by date and calculate daily statistics
        var dailyGroups = monthlyEntries
            .GroupBy(e => e.ReadingDate)
            .ToDictionary(g => g.Key, g => g.ToList());

        var dailyData = new List<DailyReadingDataDto>();
        
        // Generate data for all days in the month
        for (var date = firstDay; date <= lastDay; date = date.AddDays(1))
        {
            var entriesForDay = dailyGroups.GetValueOrDefault(date) ?? new List<ReadingEntry>();
            var pagesRead = entriesForDay.Sum(e => e.EndPage - e.StartPage + 1);
            var bookTitles = entriesForDay
                .Select(e => e.Book?.Title)
                .Where(title => !string.IsNullOrEmpty(title))
                .Distinct()
                .ToList();

            dailyData.Add(new DailyReadingDataDto
            {
                Date = date,
                PagesRead = pagesRead,
                EntriesCount = entriesForDay.Count,
                BookTitles = bookTitles!
            });
        }

        // Calculate monthly summary statistics
        var totalPages = dailyData.Sum(d => d.PagesRead);
        var totalEntries = dailyData.Sum(d => d.EntriesCount);
        var daysWithReading = dailyData.Count(d => d.HasReading);
        var maxPages = dailyData.Max(d => d.PagesRead);
        var averagePages = daysWithReading > 0 ? Math.Round((double)totalPages / DateTime.DaysInMonth(year, month), 1) : 0;

        return new DailyReadingHeatmapDto
        {
            Year = year,
            Month = month,
            MonthName = monthNames[month],
            DailyData = dailyData,
            TotalPagesMonth = totalPages,
            TotalEntriesMonth = totalEntries,
            AveragePagesPerDay = averagePages,
            MaxPagesDay = maxPages,
            DaysWithReading = daysWithReading
        };
    }
}