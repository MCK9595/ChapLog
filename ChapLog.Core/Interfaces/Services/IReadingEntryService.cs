using ChapLog.Core.DTOs.Common;
using ChapLog.Core.DTOs.ReadingEntries;

namespace ChapLog.Core.Interfaces.Services;

public interface IReadingEntryService
{
    Task<ReadingEntryDto?> GetEntryByIdAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default);
    Task<PagedResult<ReadingEntryDto>> GetEntriesByBookIdAsync(
        Guid bookId,
        Guid userId,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
    
    Task<PagedResult<ReadingEntryDto>> GetEntriesByUserAsync(
        Guid userId,
        int page = 1,
        int pageSize = 20,
        string? sortBy = null,
        string? searchQuery = null,
        CancellationToken cancellationToken = default);
    
    Task<ReadingEntryDto> CreateEntryAsync(Guid bookId, CreateReadingEntryDto createEntryDto, Guid userId, CancellationToken cancellationToken = default);
    Task<ReadingEntryDto> UpdateEntryAsync(Guid entryId, UpdateReadingEntryDto updateEntryDto, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteEntryAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default);
    
    Task<bool> EntryExistsAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> CanUserAccessEntryAsync(Guid entryId, Guid userId, CancellationToken cancellationToken = default);
}