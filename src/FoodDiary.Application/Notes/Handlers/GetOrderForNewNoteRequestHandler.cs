using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers
{
    class GetOrderForNewNoteRequestHandler : IRequestHandler<GetOrderForNewNoteRequest, int>
    {
        private readonly INoteRepository _noteRepository;

        public GetOrderForNewNoteRequestHandler(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public async Task<int> Handle(GetOrderForNewNoteRequest request, CancellationToken cancellationToken)
        {
            var query = _noteRepository.GetQueryWithoutTracking()
                .Where(n => n.PageId == request.PageId && n.MealType == request.MealType);

            var notes = await _noteRepository.GetByQueryAsync(query, cancellationToken);

            if (!notes.Any())
                return 0;
            return notes.Max(n => n.DisplayOrder) + 1;
        }
    }
}
