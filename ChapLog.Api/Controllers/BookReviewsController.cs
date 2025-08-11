using ChapLog.Core.DTOs.BookReviews;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/book-reviews")]
[ApiController]
[Authorize]
public class BookReviewsController : BaseController
{
    private readonly IBookReviewService _bookReviewService;

    public BookReviewsController(IBookReviewService bookReviewService)
    {
        _bookReviewService = bookReviewService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BookReviewWithBookDto>>>> GetReviews(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookReviewService.GetReviewsByUserAsync(userId, page, pageSize, cancellationToken);
            
            return Success(result, "Reviews retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<PagedResult<BookReviewWithBookDto>>($"Failed to retrieve reviews: {ex.Message}", 500);
        }
    }

    [HttpGet("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<BookReviewDto>>> GetReviewByBook(Guid bookId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var review = await _bookReviewService.GetReviewByBookIdAsync(bookId, userId, cancellationToken);
            
            if (review == null)
            {
                return Error<BookReviewDto>("Review not found", 404);
            }

            return Success(review, "Review retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<BookReviewDto>($"Failed to retrieve review: {ex.Message}", 500);
        }
    }

    [HttpPost("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<BookReviewDto>>> CreateReview(Guid bookId, [FromBody] CreateBookReviewDto createReviewDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var review = await _bookReviewService.CreateReviewAsync(bookId, createReviewDto, userId, cancellationToken);
            
            return CreatedAtAction(nameof(GetReviewByBook), new { bookId = bookId }, 
                Success(review, "Review created successfully"));
        }
        catch (ArgumentException ex)
        {
            return Error<BookReviewDto>(ex.Message, 400);
        }
        catch (InvalidOperationException ex)
        {
            return Error<BookReviewDto>(ex.Message, 409);
        }
        catch (Exception ex)
        {
            return Error<BookReviewDto>($"Failed to create review: {ex.Message}", 500);
        }
    }

    [HttpPut("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<BookReviewDto>>> UpdateReview(Guid bookId, [FromBody] UpdateBookReviewDto updateReviewDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var review = await _bookReviewService.UpdateReviewAsync(bookId, updateReviewDto, userId, cancellationToken);
            
            return Success(review, "Review updated successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<BookReviewDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<BookReviewDto>($"Failed to update review: {ex.Message}", 500);
        }
    }

    [HttpDelete("book/{bookId}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReview(Guid bookId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _bookReviewService.DeleteReviewAsync(bookId, userId, cancellationToken);
            
            return Success("Review deleted successfully");
        }
        catch (ArgumentException ex)
        {
            return Error(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error($"Failed to delete review: {ex.Message}", 500);
        }
    }

    [HttpGet("book/{bookId}/exists")]
    public async Task<ActionResult<ApiResponse<object>>> CheckReviewExists(Guid bookId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var exists = await _bookReviewService.ReviewExistsAsync(bookId, userId, cancellationToken);
            
            return Success((object)new { exists }, "Review existence checked successfully");
        }
        catch (Exception ex)
        {
            return Error($"Failed to check review existence: {ex.Message}", 500);
        }
    }
}