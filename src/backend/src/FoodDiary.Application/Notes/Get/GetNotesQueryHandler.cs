using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.Get;

public record GetNotesQuery(DateOnly Date);

public record GetNotesQueryResult(IReadOnlyCollection<Note> Notes);

public class GetNotesQueryHandler(INotesRepository notesRepository)
{
    public async Task<GetNotesQueryResult> Handle(
        GetNotesQuery query,
        CancellationToken cancellationToken)
    {
        var notes = await notesRepository.FindByDate(query.Date, cancellationToken);
        
        return new GetNotesQueryResult(notes);
    }
}