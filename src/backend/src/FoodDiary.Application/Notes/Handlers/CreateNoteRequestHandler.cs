using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers
{
    class CreateNoteRequestHandler : IRequestHandler<CreateNoteRequest, Note>
    {
        private readonly INoteRepository _noteRepository;

        public CreateNoteRequestHandler(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
        }

        public async Task<Note> Handle(CreateNoteRequest request, CancellationToken cancellationToken)
        {
            var createdNote = _noteRepository.Add(request.Entity);
            await _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdNote;
        }
    }
}
