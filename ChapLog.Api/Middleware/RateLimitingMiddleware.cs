using System.Collections.Concurrent;
using System.Net;

namespace ChapLog.Api.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private readonly ConcurrentDictionary<string, ClientInfo> _clients = new();
    private readonly Timer _cleanupTimer;

    // Rate limiting configuration
    private readonly int _maxRequests = 100; // Max requests per time window
    private readonly TimeSpan _timeWindow = TimeSpan.FromMinutes(1); // Time window

    public RateLimitingMiddleware(RequestDelegate next, ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
        
        // Cleanup expired entries every minute
        _cleanupTimer = new Timer(CleanupExpiredEntries, null, TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = GetClientId(context);
        var now = DateTime.UtcNow;

        var clientInfo = _clients.AddOrUpdate(clientId, 
            new ClientInfo { RequestCount = 1, WindowStart = now },
            (key, existing) =>
            {
                // Reset window if expired
                if (now - existing.WindowStart > _timeWindow)
                {
                    existing.RequestCount = 1;
                    existing.WindowStart = now;
                }
                else
                {
                    existing.RequestCount++;
                }
                return existing;
            });

        if (clientInfo.RequestCount > _maxRequests)
        {
            _logger.LogWarning("Rate limit exceeded for client {ClientId}", clientId);
            
            context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
            context.Response.Headers["Retry-After"] = _timeWindow.TotalSeconds.ToString();
            
            await context.Response.WriteAsync("Rate limit exceeded. Please try again later.");
            return;
        }

        await _next(context);
    }

    private static string GetClientId(HttpContext context)
    {
        // Use IP address as client identifier
        var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        
        // In production, you might want to use a more sophisticated approach
        // like combining IP with user agent or using authentication tokens
        return clientIp;
    }

    private void CleanupExpiredEntries(object? state)
    {
        var now = DateTime.UtcNow;
        var expiredKeys = _clients
            .Where(kvp => now - kvp.Value.WindowStart > _timeWindow)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _clients.TryRemove(key, out _);
        }

        _logger.LogDebug("Cleaned up {Count} expired rate limiting entries", expiredKeys.Count);
    }

    private class ClientInfo
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }
}