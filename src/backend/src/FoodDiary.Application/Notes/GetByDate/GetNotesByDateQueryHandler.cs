using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.GetByDate;

public record GetNotesByDateQuery(DateOnly Date);

public record GetNotesByDateQueryResult(IReadOnlyCollection<Note> Notes);

public class GetNotesByDateQueryHandler(INotesRepository notesRepository)
{
    public async Task<GetNotesByDateQueryResult> Handle(
        GetNotesByDateQuery query,
        CancellationToken cancellationToken)
    {
        var notes = await notesRepository.FindByDate(query.Date, cancellationToken);
        
        return new GetNotesByDateQueryResult(notes);
    }
}