namespace ChapLog.Core.DTOs.Common;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public bool Success { get; set; } = true;
    public string Message { get; set; } = "Success";
    public List<ValidationError> Errors { get; set; } = new();

    public static ApiResponse<T> SuccessResult(T data, string message = "Success")
    {
        return new ApiResponse<T>
        {
            Data = data,
            Success = true,
            Message = message
        };
    }

    public static ApiResponse<T> ErrorResult(string message, List<ValidationError>? errors = null)
    {
        return new ApiResponse<T>
        {
            Data = default,
            Success = false,
            Message = message,
            Errors = errors ?? new List<ValidationError>()
        };
    }
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse SuccessResult(string message = "Success")
    {
        return new ApiResponse
        {
            Success = true,
            Message = message
        };
    }

    public static new ApiResponse ErrorResult(string message, List<ValidationError>? errors = null)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<ValidationError>()
        };
    }
}