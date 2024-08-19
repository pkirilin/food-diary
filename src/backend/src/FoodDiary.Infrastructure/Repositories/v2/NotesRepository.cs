using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Infrastructure.Repositories.v2;

public class NotesRepository(FoodDiaryContext context) : INotesRepository
{
    public async Task<Note> FindById(int id, CancellationToken cancellationToken)
    {
        return await context.Notes.FindAsync([id], cancellationToken);
    }

    public Task Update(Note note, CancellationToken cancellationToken)
    {
        context.Update(note);
        return context.SaveChangesAsync(cancellationToken);
    }
}