using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers
{
    public class GetNotesByIdsRequestHandler : IRequestHandler<GetNotesByIdsRequest, List<Note>>
    {
        private readonly INoteRepository _noteRepository;

        public GetNotesByIdsRequestHandler(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public Task<List<Note>> Handle(GetNotesByIdsRequest request, CancellationToken cancellationToken)
        {
            var query = _noteRepository.GetQuery().Where(n => request.Ids.Contains(n.Id));
            return _noteRepository.GetListFromQueryAsync(query, cancellationToken);
        }
    }
}
