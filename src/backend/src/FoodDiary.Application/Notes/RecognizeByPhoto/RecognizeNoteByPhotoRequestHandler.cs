using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Notes.RecognizeByPhoto;

public abstract record RecognizeNoteByPhotoResponse
{
    public record Success : RecognizeNoteByPhotoResponse;
}

public record RecognizeNoteByPhotoRequest(IReadOnlyList<string> PhotoUrls) : IRequest<RecognizeNoteByPhotoResponse>;

[UsedImplicitly]
internal class RecognizeNoteByPhotoRequestHandler
    : IRequestHandler<RecognizeNoteByPhotoRequest, RecognizeNoteByPhotoResponse>
{
    public async Task<RecognizeNoteByPhotoResponse> Handle(
        RecognizeNoteByPhotoRequest request,
        CancellationToken cancellationToken)
    {
        return new RecognizeNoteByPhotoResponse.Success();
    }
}