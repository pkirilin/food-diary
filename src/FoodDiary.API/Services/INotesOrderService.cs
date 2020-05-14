using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface INotesOrderService
    {
        Task<int> GetOrderForNewNoteAsync(Note note, CancellationToken cancellationToken);

        Task ReorderNotesOnDeleteAsync(Note noteForDelete, CancellationToken cancellationToken);

        Task ReorderNotesOnDeleteRangeAsync(IEnumerable<Note> notesForDelete, CancellationToken cancellationToken);

        Task ReorderNotesOnMoveAsync(Note noteForMove, NoteMoveRequestDto moveRequest, CancellationToken cancellationToken);
    }
}
