using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.CreatePage;

public record CreatePageRequest(DateOnly Date) : IRequest<CreatePageResponse>;

public abstract record CreatePageResponse
{
    public record PageAlreadyExists : CreatePageResponse;
    public record Success(int Id) : CreatePageResponse;
}

[UsedImplicitly]
internal class CreatePageRequestHandler(
    IPagesRepository repository) : IRequestHandler<CreatePageRequest, CreatePageResponse>
{
    public async Task<CreatePageResponse> Handle(CreatePageRequest request, CancellationToken cancellationToken)
    {
        var pageWithTheSameDate = await repository.FindByDate(request.Date, cancellationToken);

        if (pageWithTheSameDate is not null)
        {
            return new CreatePageResponse.PageAlreadyExists();
        }

        var page = new Page
        {
            Date = request.Date
        };

        var id = await repository.Create(page, cancellationToken);
        
        return new CreatePageResponse.Success(id);
    }
}