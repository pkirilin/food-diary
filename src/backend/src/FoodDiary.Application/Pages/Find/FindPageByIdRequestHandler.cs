using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Find;

public record FindPageByIdRequest(int Id) : IRequest<FindPageByIdResponse>;

public abstract record FindPageByIdResponse
{
    public record PageNotFound : FindPageByIdResponse;
    public record Success(Page Page) : FindPageByIdResponse;
};

[UsedImplicitly]
internal class FindPageByIdRequestHandler(
    IPagesRepository repository) : IRequestHandler<FindPageByIdRequest, FindPageByIdResponse>
{
    public async Task<FindPageByIdResponse> Handle(FindPageByIdRequest request, CancellationToken cancellationToken)
    {
        var page = await repository.FindById(request.Id, cancellationToken);

        if (page is null)
        {
            return new FindPageByIdResponse.PageNotFound();
        }
        
        return new FindPageByIdResponse.Success(page);
    }
}