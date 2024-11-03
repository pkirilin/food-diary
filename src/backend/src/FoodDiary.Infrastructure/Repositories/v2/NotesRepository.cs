using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

public class NotesRepository(FoodDiaryContext context) : INotesRepository
{
    public async Task<IReadOnlyCollection<Note>> FindByDate(DateOnly date, CancellationToken cancellationToken)
    {
        return await context.Notes
            .AsNoTracking()
            .Where(n => n.Date == date)
            .Include(n => n.Product)
            .OrderBy(n => n.DisplayOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Note>> FindByDateRange(
        DateOnly from,
        DateOnly to,
        CancellationToken cancellationToken)
    {
        return await context.Notes
            .AsNoTracking()
            .Where(n => n.Date >= from && n.Date <= to)
            .Include(n => n.Product)
            .OrderByDescending(n => n.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<Note> FindById(int id, CancellationToken cancellationToken)
    {
        return await context.Notes.FindAsync([id], cancellationToken);
    }

    public Task Add(Note note, CancellationToken cancellationToken)
    {
        context.Notes.Add(note);
        return context.SaveChangesAsync(cancellationToken);
    }

    public Task Update(Note note, CancellationToken cancellationToken)
    {
        context.Update(note);
        return context.SaveChangesAsync(cancellationToken);
    }
}