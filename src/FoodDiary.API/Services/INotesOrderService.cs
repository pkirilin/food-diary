using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Services
{
    public interface INotesOrderService
    {
        /// <summary>
        /// Gets display order for next created note in target notes group
        /// </summary>
        /// <param name="pageId">Page id of target notes group</param>
        /// <param name="mealType">Meal type of target notes group</param>
        /// <param name="cancellationToken"></param>
        Task<int> GetOrderForNewNoteAsync(int pageId, MealType mealType, CancellationToken cancellationToken);

        /// <summary>
        /// Recalculates display orders of target note's group without target note
        /// </summary>
        Task ReorderNotesOnDeleteAsync(Note noteForDelete, CancellationToken cancellationToken);

        /// <summary>
        /// Recalculates display orders of target notes' group without target notes
        /// </summary>
        Task ReorderNotesOnDeleteRangeAsync(IEnumerable<Note> notesForDelete, CancellationToken cancellationToken);

        /// <summary>
        /// Recalculates display orders of target note's source group without target note
        /// and destination group with target note
        /// </summary>
        /// <param name="noteForMove">Target note</param>
        /// <param name="moveRequest">Note move parameters</param>
        /// <param name="cancellationToken"></param>
        Task ReorderNotesOnMoveAsync(Note noteForMove, NoteMoveRequest moveRequest, CancellationToken cancellationToken);
    }
}
