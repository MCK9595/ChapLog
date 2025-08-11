namespace ChapLog.Core.DTOs.Statistics;

public class GenreStatisticsDto
{
    public List<GenreDataDto> GenreData { get; set; } = new();
    public int TotalGenres { get; set; }
    public string? MostReadGenre { get; set; }
    public string? HighestCompletionRateGenre { get; set; }
}

public class GenreDataDto
{
    public string Genre { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}