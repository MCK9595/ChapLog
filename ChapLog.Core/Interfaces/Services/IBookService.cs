using ChapLog.Core.DTOs.Books;
using ChapLog.Core.DTOs.Common;

namespace ChapLog.Core.Interfaces.Services;

public interface IBookService
{
    Task<BookDto?> GetBookByIdAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    Task<PagedResult<BookDto>> GetBooksAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? searchTerm = null,
        string sortBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default);
    
    Task<BookDto> CreateBookAsync(CreateBookDto createBookDto, Guid userId, CancellationToken cancellationToken = default);
    Task<BookDto> UpdateBookAsync(Guid bookId, UpdateBookDto updateBookDto, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteBookAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    Task<BookDto> UpdateBookStatusAsync(Guid bookId, Guid userId, string status, CancellationToken cancellationToken = default);
    
    Task<bool> BookExistsAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> CanUserAccessBookAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
}