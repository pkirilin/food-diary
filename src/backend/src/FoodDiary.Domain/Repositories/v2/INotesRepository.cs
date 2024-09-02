using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

#nullable enable

namespace FoodDiary.Domain.Repositories.v2;

public interface INotesRepository
{
    Task<IReadOnlyCollection<Note>> FindByDate(DateOnly date, CancellationToken cancellationToken);
    
    Task<IReadOnlyCollection<Note>> FindByDateRange(DateOnly from, DateOnly to, CancellationToken cancellationToken);
    
    Task<Note?> FindById(int id, CancellationToken cancellationToken);
    
    Task Add(Note note, CancellationToken cancellationToken);
    
    Task Update(Note note, CancellationToken cancellationToken);
}