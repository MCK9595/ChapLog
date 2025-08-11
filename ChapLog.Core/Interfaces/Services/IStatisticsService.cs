using ChapLog.Core.DTOs.Statistics;

namespace ChapLog.Core.Interfaces.Services;

public interface IStatisticsService
{
    Task<StatisticsSummaryDto> GetSummaryAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<MonthlyStatisticsDto> GetMonthlyStatisticsAsync(Guid userId, int year, CancellationToken cancellationToken = default);
    Task<GenreStatisticsDto> GetGenreStatisticsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<UserActivityDto>> GetRecentActivitiesAsync(Guid userId, int limit = 20, CancellationToken cancellationToken = default);
    Task<DailyReadingHeatmapDto> GetDailyReadingHeatmapAsync(Guid userId, int year, int month, CancellationToken cancellationToken = default);
}