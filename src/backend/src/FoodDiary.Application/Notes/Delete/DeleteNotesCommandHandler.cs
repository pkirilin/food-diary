using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Notes.Delete;

public record DeleteNotesCommand(IReadOnlyCollection<int> Ids);

public abstract record DeleteNotesResult
{
    public record Success : DeleteNotesResult;
}

public class DeleteNotesCommandHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
{
    public async Task<DeleteNotesResult> Handle(DeleteNotesCommand command, CancellationToken cancellationToken)
    {
        var notesForDeleteQuery = noteRepository.GetQuery().Where(n => command.Ids.Contains(n.Id));
        var notesForDelete = await noteRepository.GetByQueryAsync(notesForDeleteQuery, cancellationToken);

        if (notesForDelete.Count == 0)
        {
            return new DeleteNotesResult.Success();
        }

        var notesForDeleteIds = notesForDelete.Select(n => n.Id).ToList();
        var date = notesForDelete[0].Date;
        var mealType = notesForDelete[0].MealType;

        var remainingQuery = noteRepository.GetQuery()
            .Where(n => n.Date == date)
            .Where(n => n.MealType == mealType)
            .Where(n => !notesForDeleteIds.Contains(n.Id));
        var remainingNotes = await noteRepository.GetByQueryAsync(remainingQuery, cancellationToken);

        notesOrderCalculator.RecalculateDisplayOrders(remainingNotes);

        noteRepository.RemoveRange(notesForDelete);
        await noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteNotesResult.Success();
    }
}
