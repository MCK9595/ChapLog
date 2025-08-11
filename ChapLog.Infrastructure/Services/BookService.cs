using ChapLog.Core.DTOs.Books;
using ChapLog.Core.DTOs.Common;
using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;

namespace ChapLog.Infrastructure.Services;

public class BookService : IBookService
{
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;

    public BookService(IBookRepository bookRepository, IUserRepository userRepository)
    {
        _bookRepository = bookRepository;
        _userRepository = userRepository;
    }

    public async Task<BookDto?> GetBookByIdAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
            return null;

        return MapToDto(book);
    }

    public async Task<PagedResult<BookDto>> GetBooksAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        string? status = null,
        string? searchTerm = null,
        string sortBy = "CreatedAt",
        bool ascending = false,
        CancellationToken cancellationToken = default)
    {
        var result = await _bookRepository.GetPagedWithFiltersAsync(
            userId, page, pageSize, status, searchTerm, sortBy, ascending, cancellationToken);

        var bookDtos = result.Items.Select(MapToDto).ToList();

        return new PagedResult<BookDto>
        {
            Items = bookDtos,
            TotalCount = result.TotalCount,
            CurrentPage = page,
            PageSize = pageSize,
            PageCount = (int)Math.Ceiling((double)result.TotalCount / pageSize)
        };
    }

    public async Task<BookDto> CreateBookAsync(CreateBookDto createBookDto, Guid userId, CancellationToken cancellationToken = default)
    {
        if (!await _userRepository.ExistsAsync(u => u.Id == userId, cancellationToken))
        {
            throw new ArgumentException("User not found");
        }

        var book = new Book
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = createBookDto.Title,
            Author = createBookDto.Author,
            Publisher = createBookDto.Publisher,
            PublicationYear = createBookDto.PublicationYear,
            Genre = createBookDto.Genre,
            TotalPages = createBookDto.TotalPages,
            Status = "unread",
            CurrentPage = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdBook = await _bookRepository.CreateAsync(book, cancellationToken);
        return MapToDto(createdBook);
    }

    public async Task<BookDto> UpdateBookAsync(Guid bookId, UpdateBookDto updateBookDto, Guid userId, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
        {
            throw new ArgumentException("Book not found or access denied");
        }

        book.Title = updateBookDto.Title;
        book.Author = updateBookDto.Author;
        book.Publisher = updateBookDto.Publisher;
        book.PublicationYear = updateBookDto.PublicationYear;
        book.Genre = updateBookDto.Genre;
        book.TotalPages = updateBookDto.TotalPages;
        book.UpdatedAt = DateTime.UtcNow;

        await _bookRepository.UpdateAsync(book, cancellationToken);
        return MapToDto(book);
    }

    public async Task DeleteBookAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
        {
            throw new ArgumentException("Book not found or access denied");
        }

        await _bookRepository.DeleteAsync(book, cancellationToken);
    }

    public async Task<BookDto> UpdateBookStatusAsync(Guid bookId, Guid userId, string status, CancellationToken cancellationToken = default)
    {
        var validStatuses = new[] { "unread", "reading", "completed" };
        if (!validStatuses.Contains(status))
        {
            throw new ArgumentException("Invalid status");
        }

        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
        {
            throw new ArgumentException("Book not found or access denied");
        }

        book.Status = status;
        book.UpdatedAt = DateTime.UtcNow;

        if (status == "completed" && book.TotalPages.HasValue)
        {
            book.CurrentPage = book.TotalPages.Value;
        }

        await _bookRepository.UpdateAsync(book, cancellationToken);
        return MapToDto(book);
    }

    public async Task<bool> BookExistsAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _bookRepository.ExistsAsync(b => b.Id == bookId && b.UserId == userId, cancellationToken);
    }

    public async Task<bool> CanUserAccessBookAsync(Guid bookId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await BookExistsAsync(bookId, userId, cancellationToken);
    }

    private static BookDto MapToDto(Book book)
    {
        return new BookDto
        {
            Id = book.Id,
            Title = book.Title,
            Author = book.Author,
            Publisher = book.Publisher,
            PublicationYear = book.PublicationYear,
            Genre = book.Genre,
            TotalPages = book.TotalPages,
            Status = book.Status,
            CurrentPage = book.CurrentPage,
            CreatedAt = book.CreatedAt,
            UpdatedAt = book.UpdatedAt
        };
    }
}