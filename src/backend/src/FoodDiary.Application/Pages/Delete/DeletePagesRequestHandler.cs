using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Delete;

public record DeletePagesRequest(IReadOnlyList<int> Ids) : IRequest<DeletePagesResponse>;

public abstract record DeletePagesResponse
{
    public record SomePagesWereNotFound : DeletePagesResponse;
    public record Success : DeletePagesResponse;
}

[UsedImplicitly]
internal class DeletePagesRequestHandler(
    IPagesRepository repository): IRequestHandler<DeletePagesRequest, DeletePagesResponse>
{
    public async Task<DeletePagesResponse> Handle(DeletePagesRequest request, CancellationToken cancellationToken)
    {
        var pages = await repository.FindByIds(request.Ids, cancellationToken);

        if (pages.Count != request.Ids.Count)
        {
            return new DeletePagesResponse.SomePagesWereNotFound();
        }
        
        await repository.Delete(pages, cancellationToken);
        
        return new DeletePagesResponse.Success();
    }
}