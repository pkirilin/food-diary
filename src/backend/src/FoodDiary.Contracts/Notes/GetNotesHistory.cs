using System.ComponentModel.DataAnnotations;
using JetBrains.Annotations;

namespace FoodDiary.Contracts.Notes;

[PublicAPI]
public class GetNotesHistoryRequest
{
    [Required]
    public DateOnly? From { get; init; }
    
    [Required]
    public DateOnly? To { get; init; }
}

[PublicAPI]
public record GetNotesHistoryResponse(IReadOnlyCollection<NotesHistoryItem> NotesHistory);

[PublicAPI]
public record NotesHistoryItem(DateOnly Date, int CaloriesCount);