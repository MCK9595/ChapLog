namespace ChapLog.Core.DTOs.Statistics;

public class StatisticsSummaryDto
{
    public int TotalBooks { get; set; }
    public int CompletedBooks { get; set; }
    public int ReadingBooks { get; set; }
    public int UnreadBooks { get; set; }
    public int TotalPagesRead { get; set; }
    public double AverageRating { get; set; }
    public int ReadingStreak { get; set; }
    public int BooksThisMonth { get; set; }
    public int PagesThisMonth { get; set; }
    public int BooksThisYear { get; set; }
    public int PagesThisYear { get; set; }
}