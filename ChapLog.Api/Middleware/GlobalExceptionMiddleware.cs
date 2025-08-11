using ChapLog.Core.DTOs.Common;
using System.Net;
using System.Text.Json;

namespace ChapLog.Api.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new ApiResponse<object>
        {
            Success = false,
            Data = null
        };

        switch (exception)
        {
            case UnauthorizedAccessException:
                response.Message = "Unauthorized access";
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;
            
            case ArgumentException:
                response.Message = exception.Message;
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;
            
            case InvalidOperationException:
                response.Message = exception.Message;
                context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                break;
            
            case KeyNotFoundException:
                response.Message = "Resource not found";
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;
            
            default:
                response.Message = "An internal server error occurred";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}