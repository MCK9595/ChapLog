using ChapLog.Core.DTOs.ReadingEntries;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/reading-entries")]
[ApiController]
[Authorize]
public class ReadingEntriesController : BaseController
{
    private readonly IReadingEntryService _readingEntryService;

    public ReadingEntriesController(IReadingEntryService readingEntryService)
    {
        _readingEntryService = readingEntryService;
    }

    // Simple test endpoint first
    [HttpGet("test")]
    public ActionResult<ApiResponse<string>> TestEndpoint()
    {
        return Success("ReadingEntries endpoint is working!", "Test successful");
    }

    // Test endpoint without authentication
    [HttpGet("test-noauth")]
    [AllowAnonymous]
    public ActionResult<ApiResponse<string>> TestEndpointNoAuth()
    {
        return Success("ReadingEntries endpoint is working without auth!", "Test successful");
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ReadingEntryDto>>>> GetEntries(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _readingEntryService.GetEntriesByUserAsync(
                userId, page, pageSize, sortBy, search, cancellationToken);
            
            return Success(result, "Reading entries retrieved successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<PagedResult<ReadingEntryDto>>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<PagedResult<ReadingEntryDto>>($"Failed to retrieve reading entries: {ex.Message}", 500);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ReadingEntryDto>>> GetEntry(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var entry = await _readingEntryService.GetEntryByIdAsync(id, userId, cancellationToken);
            
            if (entry == null)
            {
                return Error<ReadingEntryDto>("Reading entry not found", 404);
            }

            return Success(entry, "Reading entry retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<ReadingEntryDto>($"Failed to retrieve reading entry: {ex.Message}", 500);
        }
    }

    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<ReadingEntryDto>>>> GetEntriesByBook(
        Guid bookId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _readingEntryService.GetEntriesByBookIdAsync(
                bookId, userId, page, pageSize, cancellationToken);
            
            return Success(result, "Reading entries retrieved successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<PagedResult<ReadingEntryDto>>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<PagedResult<ReadingEntryDto>>($"Failed to retrieve reading entries: {ex.Message}", 500);
        }
    }

    [HttpPost("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<ReadingEntryDto>>> CreateEntry(Guid bookId, [FromBody] CreateReadingEntryDto createEntryDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var entry = await _readingEntryService.CreateEntryAsync(bookId, createEntryDto, userId, cancellationToken);
            
            return Success(entry, "Reading entry created successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<ReadingEntryDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<ReadingEntryDto>($"Failed to create reading entry: {ex.Message}", 500);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ReadingEntryDto>>> UpdateEntry(Guid id, [FromBody] UpdateReadingEntryDto updateEntryDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var entry = await _readingEntryService.UpdateEntryAsync(id, updateEntryDto, userId, cancellationToken);
            
            return Success(entry, "Reading entry updated successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<ReadingEntryDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<ReadingEntryDto>($"Failed to update reading entry: {ex.Message}", 500);
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteEntry(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _readingEntryService.DeleteEntryAsync(id, userId, cancellationToken);
            
            return Success("Reading entry deleted successfully");
        }
        catch (ArgumentException ex)
        {
            return Error(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error($"Failed to delete reading entry: {ex.Message}", 500);
        }
    }

    [HttpGet("{id}/exists")]
    public async Task<ActionResult<ApiResponse<object>>> CheckEntryExists(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var exists = await _readingEntryService.EntryExistsAsync(id, userId, cancellationToken);
            
            return Success((object)new { exists }, "Entry existence checked successfully");
        }
        catch (Exception ex)
        {
            return Error($"Failed to check entry existence: {ex.Message}", 500);
        }
    }
}