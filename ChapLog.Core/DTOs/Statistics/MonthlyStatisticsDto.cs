namespace ChapLog.Core.DTOs.Statistics;

public class MonthlyStatisticsDto
{
    public int Year { get; set; }
    public List<MonthlyDataDto> MonthlyData { get; set; } = new();
    public int TotalEntries { get; set; }
    public int TotalBooksCompleted { get; set; }
    public double AverageEntriesPerMonth { get; set; }
    public int MostActiveMonth { get; set; }
}

public class MonthlyDataDto
{
    public string Month { get; set; } = string.Empty;
    public int BooksCompleted { get; set; }
    public int PagesRead { get; set; }
    public int EntriesCount { get; set; }
}