using ChapLog.Core.DTOs.BookReviews;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;

namespace ChapLog.Infrastructure.Services;

public class BookReviewService : IBookReviewService
{
    private readonly IBookReviewRepository _bookReviewRepository;
    private readonly IBookRepository _bookRepository;

    public BookReviewService(IBookReviewRepository bookReviewRepository, IBookRepository bookRepository)
    {
        _bookReviewRepository = bookReviewRepository;
        _bookRepository = bookRepository;
    }

    public async Task<BookReviewDto?> GetReviewByBookIdAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        if (!await _bookRepository.ExistsAsync(b => b.Id == bookId && b.UserId == userId, cancellationToken))
        {
            return null;
        }

        var review = await _bookReviewRepository.GetByBookIdAsync(bookId, cancellationToken);
        
        if (review == null || review.UserId != userId)
            return null;

        return MapToDto(review);
    }

    public async Task<PagedResult<BookReviewWithBookDto>> GetReviewsByUserAsync(Guid userId, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default)
    {
        var (reviews, totalCount) = await _bookReviewRepository.GetPagedAsync(
            page, 
            pageSize, 
            predicate: r => r.UserId == userId,
            orderBy: r => r.CreatedAt,
            ascending: false,
            cancellationToken);

        var reviewDtos = new List<BookReviewWithBookDto>();
        
        foreach (var review in reviews)
        {
            var book = await _bookRepository.GetByIdAsync(review.BookId, cancellationToken);
            if (book != null)
            {
                reviewDtos.Add(MapToWithBookDto(review, book));
            }
        }

        return new PagedResult<BookReviewWithBookDto>(
            reviewDtos, 
            totalCount, 
            page, 
            pageSize);
    }

    public async Task<BookReviewDto> CreateReviewAsync(Guid bookId, CreateBookReviewDto createReviewDto, Guid userId, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
        {
            throw new ArgumentException("Book not found or access denied");
        }

        if (book.Status != "completed")
        {
            throw new InvalidOperationException("Can only review completed books");
        }

        if (await _bookReviewRepository.ExistsByBookIdAsync(bookId, cancellationToken))
        {
            throw new InvalidOperationException("Review already exists for this book");
        }

        var review = new BookReview
        {
            Id = Guid.NewGuid(),
            BookId = bookId,
            UserId = userId,
            CompletedDate = createReviewDto.CompletedDate,
            OverallImpression = createReviewDto.OverallImpression,
            KeyLearnings = createReviewDto.KeyLearnings ?? new List<string>(),
            OverallRating = createReviewDto.OverallRating,
            RecommendationLevel = createReviewDto.RecommendationLevel,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdReview = await _bookReviewRepository.CreateAsync(review, cancellationToken);
        return MapToDto(createdReview);
    }

    public async Task<BookReviewDto> UpdateReviewAsync(Guid bookId, UpdateBookReviewDto updateReviewDto, Guid userId, CancellationToken cancellationToken = default)
    {
        var review = await _bookReviewRepository.GetByBookIdAsync(bookId, cancellationToken);
        
        if (review == null || review.UserId != userId)
        {
            throw new ArgumentException("Review not found or access denied");
        }

        review.CompletedDate = updateReviewDto.CompletedDate;
        review.OverallImpression = updateReviewDto.OverallImpression;
        review.KeyLearnings = updateReviewDto.KeyLearnings ?? new List<string>();
        review.OverallRating = updateReviewDto.OverallRating;
        review.RecommendationLevel = updateReviewDto.RecommendationLevel;
        review.UpdatedAt = DateTime.UtcNow;

        await _bookReviewRepository.UpdateAsync(review, cancellationToken);
        return MapToDto(review);
    }

    public async Task DeleteReviewAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        var review = await _bookReviewRepository.GetByBookIdAsync(bookId, cancellationToken);
        
        if (review == null || review.UserId != userId)
        {
            throw new ArgumentException("Review not found or access denied");
        }

        await _bookReviewRepository.DeleteAsync(review, cancellationToken);
    }

    public async Task<bool> ReviewExistsAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        var review = await _bookReviewRepository.GetByBookIdAsync(bookId, cancellationToken);
        return review != null && review.UserId == userId;
    }

    public async Task<bool> CanUserAccessReviewAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _bookRepository.ExistsAsync(b => b.Id == bookId && b.UserId == userId, cancellationToken);
    }

    private static BookReviewDto MapToDto(BookReview review)
    {
        return new BookReviewDto
        {
            Id = review.Id,
            BookId = review.BookId,
            CompletedDate = review.CompletedDate,
            OverallImpression = review.OverallImpression,
            KeyLearnings = review.KeyLearnings,
            OverallRating = review.OverallRating,
            RecommendationLevel = review.RecommendationLevel,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt
        };
    }

    private static BookReviewWithBookDto MapToWithBookDto(BookReview review, Book book)
    {
        return new BookReviewWithBookDto
        {
            Id = review.Id,
            BookId = review.BookId,
            CompletedDate = review.CompletedDate,
            OverallImpression = review.OverallImpression,
            KeyLearnings = review.KeyLearnings,
            OverallRating = review.OverallRating,
            RecommendationLevel = review.RecommendationLevel,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            BookTitle = book.Title,
            BookAuthor = book.Author,
            BookGenre = book.Genre ?? string.Empty,
            BookTotalPages = book.TotalPages ?? 0,
            BookImageUrl = book.CoverImageUrl
        };
    }
}