using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers;

class EditNoteRequestHandler : IRequestHandler<EditNoteRequest, int>
{
    private readonly INoteRepository _noteRepository;

    public EditNoteRequestHandler(INoteRepository noteRepository)
    {
        _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
    }

    public Task<int> Handle(EditNoteRequest request, CancellationToken cancellationToken)
    {
        _noteRepository.Update(request.Entity);
        return _noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
    }
}