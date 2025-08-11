namespace ChapLog.Core.DTOs.Common;

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public ValidationError() { }

    public ValidationError(string field, string message)
    {
        Field = field;
        Message = message;
    }
}