namespace ChapLog.Core.DTOs.Statistics;

public class DailyReadingHeatmapDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public List<DailyReadingDataDto> DailyData { get; set; } = new();
    public int TotalPagesMonth { get; set; }
    public int TotalEntriesMonth { get; set; }
    public double AveragePagesPerDay { get; set; }
    public int MaxPagesDay { get; set; }
    public int DaysWithReading { get; set; }
}

public class DailyReadingDataDto
{
    public DateOnly Date { get; set; }
    public int PagesRead { get; set; }
    public int EntriesCount { get; set; }
    public List<string> BookTitles { get; set; } = new();
    public bool HasReading => PagesRead > 0;
}