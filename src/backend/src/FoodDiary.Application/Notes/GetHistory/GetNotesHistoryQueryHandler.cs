using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Notes.GetHistory;

public record GetNotesHistoryQuery(DateOnly From, DateOnly To);

public record GetNotesHistoryQueryResult(IReadOnlyCollection<Note> Notes);

public class GetNotesHistoryQueryHandler(INotesRepository notesRepository)
{
    public async Task<GetNotesHistoryQueryResult> Handle(
        GetNotesHistoryQuery query,
        CancellationToken cancellationToken)
    {
        var notes = await notesRepository.FindByDateRange(query.From, query.To, cancellationToken);
        
        return new GetNotesHistoryQueryResult(notes);
    }
}