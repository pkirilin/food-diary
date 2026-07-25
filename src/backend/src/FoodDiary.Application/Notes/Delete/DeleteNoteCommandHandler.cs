using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Notes.Delete;

public record DeleteNoteCommand(int Id);

public abstract record DeleteNoteResult
{
    public record Success : DeleteNoteResult;

    public record NotFound : DeleteNoteResult;
}

public class DeleteNoteCommandHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
{
    public async Task<DeleteNoteResult> Handle(DeleteNoteCommand command, CancellationToken cancellationToken)
    {
        var note = await noteRepository.GetByIdAsync(command.Id, cancellationToken);

        if (note is null)
        {
            return new DeleteNoteResult.NotFound();
        }

        var remainingQuery = noteRepository.GetQuery()
            .Where(n => n.Date == note.Date)
            .Where(n => n.MealType == note.MealType)
            .Where(n => n.Id != note.Id);
        var remainingNotes = await noteRepository.GetByQueryAsync(remainingQuery, cancellationToken);

        notesOrderCalculator.RecalculateDisplayOrders(remainingNotes);

        noteRepository.Remove(note);
        await noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteNoteResult.Success();
    }
}
