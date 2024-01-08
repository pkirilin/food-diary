using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Notes.Handlers;

class GetNoteByIdRequestHandler : IRequestHandler<GetNoteByIdRequest, Note>
{
    private readonly INoteRepository _noteRepository;

    public GetNoteByIdRequestHandler(INoteRepository noteRepository)
    {
        _noteRepository = noteRepository ?? throw new ArgumentNullException(nameof(noteRepository));
    }

    public Task<Note> Handle(GetNoteByIdRequest request, CancellationToken cancellationToken)
    {
        return _noteRepository.GetByIdAsync(request.Id, cancellationToken);
    }
}