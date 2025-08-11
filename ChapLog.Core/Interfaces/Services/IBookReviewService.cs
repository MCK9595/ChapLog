using ChapLog.Core.DTOs.BookReviews;
using ChapLog.Core.DTOs.Common;

namespace ChapLog.Core.Interfaces.Services;

public interface IBookReviewService
{
    Task<BookReviewDto?> GetReviewByBookIdAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    Task<PagedResult<BookReviewWithBookDto>> GetReviewsByUserAsync(Guid userId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<BookReviewDto> CreateReviewAsync(Guid bookId, CreateBookReviewDto createReviewDto, Guid userId, CancellationToken cancellationToken = default);
    Task<BookReviewDto> UpdateReviewAsync(Guid bookId, UpdateBookReviewDto updateReviewDto, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteReviewAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    
    Task<bool> ReviewExistsAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> CanUserAccessReviewAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default);
}