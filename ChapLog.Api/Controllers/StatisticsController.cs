using ChapLog.Core.DTOs.Common;
using ChapLog.Core.DTOs.Statistics;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/statistics")]
[ApiController]
[Authorize]
public class StatisticsController : BaseController
{
    private readonly IStatisticsService _statisticsService;

    public StatisticsController(IStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApiResponse<StatisticsSummaryDto>>> GetSummary(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var summary = await _statisticsService.GetSummaryAsync(userId, cancellationToken);
            
            return Success(summary, "Statistics summary retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<StatisticsSummaryDto>($"Failed to retrieve statistics summary: {ex.Message}", 500);
        }
    }

    [HttpGet("monthly/{year}")]
    public async Task<ActionResult<ApiResponse<MonthlyStatisticsDto>>> GetMonthlyStatistics(int year, CancellationToken cancellationToken)
    {
        try
        {
            if (year < 2000 || year > DateTime.Now.Year + 1)
            {
                return Error<MonthlyStatisticsDto>("Invalid year", 400);
            }

            var userId = GetCurrentUserId();
            var statistics = await _statisticsService.GetMonthlyStatisticsAsync(userId, year, cancellationToken);
            
            return Success(statistics, "Monthly statistics retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<MonthlyStatisticsDto>($"Failed to retrieve monthly statistics: {ex.Message}", 500);
        }
    }

    [HttpGet("genres")]
    public async Task<ActionResult<ApiResponse<GenreStatisticsDto>>> GetGenreStatistics(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var statistics = await _statisticsService.GetGenreStatisticsAsync(userId, cancellationToken);
            
            return Success(statistics, "Genre statistics retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<GenreStatisticsDto>($"Failed to retrieve genre statistics: {ex.Message}", 500);
        }
    }

    [HttpGet("activities")]
    public async Task<ActionResult<ApiResponse<List<UserActivityDto>>>> GetRecentActivities(
        CancellationToken cancellationToken,
        [FromQuery] int limit = 20)
    {
        try
        {
            if (limit < 1 || limit > 100)
            {
                return Error<List<UserActivityDto>>("Limit must be between 1 and 100", 400);
            }

            var userId = GetCurrentUserId();
            var activities = await _statisticsService.GetRecentActivitiesAsync(userId, limit, cancellationToken);
            
            return Success(activities, "Recent activities retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<List<UserActivityDto>>($"Failed to retrieve recent activities: {ex.Message}", 500);
        }
    }

    [HttpGet("daily-heatmap/{year}/{month}")]
    public async Task<ActionResult<ApiResponse<DailyReadingHeatmapDto>>> GetDailyReadingHeatmap(
        int year, 
        int month, 
        CancellationToken cancellationToken)
    {
        try
        {
            if (year < 2000 || year > DateTime.Now.Year + 1)
            {
                return Error<DailyReadingHeatmapDto>("Invalid year", 400);
            }

            if (month < 1 || month > 12)
            {
                return Error<DailyReadingHeatmapDto>("Invalid month", 400);
            }

            var userId = GetCurrentUserId();
            var heatmapData = await _statisticsService.GetDailyReadingHeatmapAsync(userId, year, month, cancellationToken);
            
            return Success(heatmapData, "Daily reading heatmap retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<DailyReadingHeatmapDto>($"Failed to retrieve daily reading heatmap: {ex.Message}", 500);
        }
    }
}