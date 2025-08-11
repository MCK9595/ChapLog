using ChapLog.Core.DTOs.Common;
using ChapLog.Core.DTOs.ReadingEntries;
using ChapLog.Core.Entities;
using ChapLog.Core.Interfaces.Repositories;
using ChapLog.Core.Interfaces.Services;

namespace ChapLog.Infrastructure.Services;

public class ReadingEntryService : IReadingEntryService
{
    private readonly IReadingEntryRepository _readingEntryRepository;
    private readonly IBookRepository _bookRepository;

    public ReadingEntryService(IReadingEntryRepository readingEntryRepository, IBookRepository bookRepository)
    {
        _readingEntryRepository = readingEntryRepository;
        _bookRepository = bookRepository;
    }

    public async Task<ReadingEntryDto?> GetEntryByIdAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var entry = await _readingEntryRepository.GetByIdAsync(entryId, cancellationToken);
        
        if (entry == null || entry.UserId != userId)
            return null;

        return MapToDto(entry);
    }

    public async Task<PagedResult<ReadingEntryDto>> GetEntriesByBookIdAsync(
        Guid bookId,
        Guid userId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!await _bookRepository.ExistsAsync(b => b.Id == bookId && b.UserId == userId, cancellationToken))
        {
            throw new ArgumentException("Book not found or access denied");
        }

        var result = await _readingEntryRepository.GetPagedByBookIdAsync(bookId, page, pageSize, cancellationToken);
        
        var entryDtos = result.Items.Select(MapToDto).ToList();

        return new PagedResult<ReadingEntryDto>
        {
            Items = entryDtos,
            TotalCount = result.TotalCount,
            CurrentPage = page,
            PageSize = pageSize,
            PageCount = (int)Math.Ceiling((double)result.TotalCount / pageSize)
        };
    }

    public async Task<PagedResult<ReadingEntryDto>> GetEntriesByUserAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        string? sortBy = null,
        string? searchQuery = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _readingEntryRepository.GetPagedByUserIdAsync(
            userId, page, pageSize, sortBy, searchQuery, cancellationToken);

        var entryDtos = result.Items.Select(MapToDtoWithBook).ToList();

        return new PagedResult<ReadingEntryDto>
        {
            Items = entryDtos,
            TotalCount = result.TotalCount,
            CurrentPage = page,
            PageSize = pageSize,
            PageCount = (int)Math.Ceiling((double)result.TotalCount / pageSize)
        };
    }

    public async Task<ReadingEntryDto> CreateEntryAsync(Guid bookId, CreateReadingEntryDto createEntryDto, Guid userId, CancellationToken cancellationToken = default)
    {
        var book = await _bookRepository.GetByIdAsync(bookId, cancellationToken);
        
        if (book == null || book.UserId != userId)
        {
            throw new ArgumentException("Book not found or access denied");
        }

        if (createEntryDto.StartPage > createEntryDto.EndPage || createEntryDto.StartPage <= 0)
        {
            throw new ArgumentException("Invalid page range");
        }

        if (book.TotalPages.HasValue && createEntryDto.EndPage > book.TotalPages.Value)
        {
            throw new ArgumentException("End page exceeds total pages");
        }

        var entry = new ReadingEntry
        {
            Id = Guid.NewGuid(),
            BookId = bookId,
            UserId = userId,
            ReadingDate = createEntryDto.ReadingDate,
            StartPage = createEntryDto.StartPage,
            EndPage = createEntryDto.EndPage,
            Chapter = createEntryDto.Chapter,
            Notes = createEntryDto.Notes,
            Learnings = createEntryDto.Learnings ?? new List<string>(),
            Rating = createEntryDto.Rating,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdEntry = await _readingEntryRepository.CreateAsync(entry, cancellationToken);

        // Update book's current page if this entry advances it
        if (createEntryDto.EndPage > book.CurrentPage)
        {
            book.CurrentPage = createEntryDto.EndPage;
            
            // Update status to reading if it was unread
            if (book.Status == "unread")
            {
                book.Status = "reading";
            }
            
            // Update status to completed if we've reached the end
            if (book.TotalPages.HasValue && book.CurrentPage >= book.TotalPages.Value)
            {
                book.Status = "completed";
            }
            
            book.UpdatedAt = DateTime.UtcNow;
            await _bookRepository.UpdateAsync(book, cancellationToken);
        }

        return MapToDto(createdEntry);
    }

    public async Task<ReadingEntryDto> UpdateEntryAsync(Guid entryId, UpdateReadingEntryDto updateEntryDto, Guid userId, CancellationToken cancellationToken = default)
    {
        var entry = await _readingEntryRepository.GetByIdAsync(entryId, cancellationToken);
        
        if (entry == null || entry.UserId != userId)
        {
            throw new ArgumentException("Entry not found or access denied");
        }

        if (updateEntryDto.StartPage > updateEntryDto.EndPage || updateEntryDto.StartPage <= 0)
        {
            throw new ArgumentException("Invalid page range");
        }

        var book = await _bookRepository.GetByIdAsync(entry.BookId, cancellationToken);
        if (book?.TotalPages.HasValue == true && updateEntryDto.EndPage > book.TotalPages.Value)
        {
            throw new ArgumentException("End page exceeds total pages");
        }

        entry.ReadingDate = updateEntryDto.ReadingDate;
        entry.StartPage = updateEntryDto.StartPage;
        entry.EndPage = updateEntryDto.EndPage;
        entry.Chapter = updateEntryDto.Chapter;
        entry.Notes = updateEntryDto.Notes;
        entry.Learnings = updateEntryDto.Learnings ?? new List<string>();
        entry.Rating = updateEntryDto.Rating;
        entry.UpdatedAt = DateTime.UtcNow;

        await _readingEntryRepository.UpdateAsync(entry, cancellationToken);
        return MapToDto(entry);
    }

    public async Task DeleteEntryAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default)
    {
        var entry = await _readingEntryRepository.GetByIdAsync(entryId, cancellationToken);
        
        if (entry == null || entry.UserId != userId)
        {
            throw new ArgumentException("Entry not found or access denied");
        }

        await _readingEntryRepository.DeleteAsync(entry, cancellationToken);
    }

    public async Task<bool> EntryExistsAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await _readingEntryRepository.ExistsAsync(e => e.Id == entryId && e.UserId == userId, cancellationToken);
    }

    public async Task<bool> CanUserAccessEntryAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default)
    {
        return await EntryExistsAsync(entryId, userId, cancellationToken);
    }

    private static ReadingEntryDto MapToDto(ReadingEntry entry)
    {
        return new ReadingEntryDto
        {
            Id = entry.Id,
            BookId = entry.BookId,
            Book = new BookInfoDto
            {
                Id = entry.Book?.Id ?? entry.BookId,
                Title = entry.Book?.Title ?? "Unknown",
                Author = entry.Book?.Author ?? "Unknown"
            },
            ReadingDate = entry.ReadingDate,
            StartPage = entry.StartPage,
            EndPage = entry.EndPage,
            Chapter = entry.Chapter,
            Notes = entry.Notes,
            Impression = entry.Impression,
            Learnings = entry.Learnings,
            Rating = entry.Rating,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt
        };
    }

    private static ReadingEntryDto MapToDtoWithBook(ReadingEntry entry)
    {
        return new ReadingEntryDto
        {
            Id = entry.Id,
            BookId = entry.BookId,
            Book = new BookInfoDto
            {
                Id = entry.Book?.Id ?? entry.BookId,
                Title = entry.Book?.Title ?? "Unknown",
                Author = entry.Book?.Author ?? "Unknown"
            },
            ReadingDate = entry.ReadingDate,
            StartPage = entry.StartPage,
            EndPage = entry.EndPage,
            Chapter = entry.Chapter,
            Notes = entry.Notes,
            Impression = entry.Impression,
            Learnings = entry.Learnings,
            Rating = entry.Rating,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt
        };
    }
}