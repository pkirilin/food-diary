using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

#nullable enable

namespace FoodDiary.Domain.Repositories.v2;

public interface INotesRepository
{
    Task<Note?> FindById(int id, CancellationToken cancellationToken);
    
    Task Add(Note note, CancellationToken cancellationToken);
    
    Task Update(Note note, CancellationToken cancellationToken);
}