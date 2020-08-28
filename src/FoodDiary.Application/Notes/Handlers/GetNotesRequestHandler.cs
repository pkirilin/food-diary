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
    class GetNotesRequestHandler : IRequestHandler<GetNotesRequest, List<Note>>
    {
        private readonly INoteRepository _noteRepository;

        public GetNotesRequestHandler(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public Task<List<Note>> Handle(GetNotesRequest request, CancellationToken cancellationToken)
        {
            var query = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == request.PageId);

            if (request.MealType.HasValue)
                query = query.Where(n => n.MealType == request.MealType);
            query = query.OrderBy(n => n.MealType).ThenBy(n => n.DisplayOrder);
            query = _noteRepository.LoadProduct(query);
            return _noteRepository.GetListFromQueryAsync(query, cancellationToken);
        }
    }
}
