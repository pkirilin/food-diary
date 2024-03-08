using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Delete;

public record DeletePageRequest(int Id) : IRequest<DeletePageResponse>;

public abstract record DeletePageResponse
{
    public record PageNotFound : DeletePageResponse;
    public record Success : DeletePageResponse;
};

[UsedImplicitly]
internal class DeletePageRequestHandler(IPagesRepository repository) : IRequestHandler<DeletePageRequest, DeletePageResponse>
{
    public async Task<DeletePageResponse> Handle(DeletePageRequest request, CancellationToken cancellationToken)
    {
        var page = await repository.FindById(request.Id, cancellationToken);

        if (page is null)
        {
            return new DeletePageResponse.PageNotFound();
        }
        
        await repository.Delete(page, cancellationToken);
        
        return new DeletePageResponse.Success();
    }
}