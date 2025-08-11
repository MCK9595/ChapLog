using ChapLog.Core.DTOs.Books;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChapLog.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BooksController : BaseController
{
    private readonly IBookService _bookService;

    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<BookDto>>>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? status = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string sortBy = "CreatedAt",
        [FromQuery] bool ascending = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _bookService.GetBooksAsync(
                userId, page, pageSize, status, searchTerm, sortBy, ascending, cancellationToken);
            
            return Success(result, "Books retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<PagedResult<BookDto>>($"Failed to retrieve books: {ex.Message}", 500);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BookDto>>> GetBook(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var book = await _bookService.GetBookByIdAsync(id, userId, cancellationToken);
            
            if (book == null)
            {
                return Error<BookDto>("Book not found", 404);
            }

            return Success(book, "Book retrieved successfully");
        }
        catch (Exception ex)
        {
            return Error<BookDto>($"Failed to retrieve book: {ex.Message}", 500);
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BookDto>>> CreateBook([FromBody] CreateBookDto createBookDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var book = await _bookService.CreateBookAsync(createBookDto, userId, cancellationToken);
            
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, 
                Success(book, "Book created successfully"));
        }
        catch (ArgumentException ex)
        {
            return Error<BookDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<BookDto>($"Failed to create book: {ex.Message}", 500);
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BookDto>>> UpdateBook(Guid id, [FromBody] UpdateBookDto updateBookDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var book = await _bookService.UpdateBookAsync(id, updateBookDto, userId, cancellationToken);
            
            return Success(book, "Book updated successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<BookDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<BookDto>($"Failed to update book: {ex.Message}", 500);
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBook(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _bookService.DeleteBookAsync(id, userId, cancellationToken);
            
            return Success("Book deleted successfully");
        }
        catch (ArgumentException ex)
        {
            return Error(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error($"Failed to delete book: {ex.Message}", 500);
        }
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<ApiResponse<BookDto>>> UpdateBookStatus(Guid id, [FromBody] UpdateBookStatusDto statusDto, CancellationToken cancellationToken)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var book = await _bookService.UpdateBookStatusAsync(id, userId, statusDto.Status, cancellationToken);
            
            return Success(book, "Book status updated successfully");
        }
        catch (ArgumentException ex)
        {
            return Error<BookDto>(ex.Message, 400);
        }
        catch (Exception ex)
        {
            return Error<BookDto>($"Failed to update book status: {ex.Message}", 500);
        }
    }

    [HttpGet("{id}/exists")]
    public async Task<ActionResult<ApiResponse<object>>> CheckBookExists(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetCurrentUserId();
            var exists = await _bookService.BookExistsAsync(id, userId, cancellationToken);
            
            return Success((object)new { exists }, "Book existence checked successfully");
        }
        catch (Exception ex)
        {
            return Error($"Failed to check book existence: {ex.Message}", 500);
        }
    }
}