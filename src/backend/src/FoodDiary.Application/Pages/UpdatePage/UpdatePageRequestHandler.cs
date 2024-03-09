using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.UpdatePage;

public record UpdatePageRequest(int Id, DateOnly Date) : IRequest<UpdatePageResponse>;

public abstract record UpdatePageResponse
{
    public record PageAlreadyExists : UpdatePageResponse;
    public record PageNotFound : UpdatePageResponse;
    public record Success : UpdatePageResponse;
}

[UsedImplicitly]
internal class UpdatePageRequestHandler(
    IPagesRepository repository) : IRequestHandler<UpdatePageRequest, UpdatePageResponse>
{
    public async Task<UpdatePageResponse> Handle(UpdatePageRequest request, CancellationToken cancellationToken)
    {
        var pageWithTheSameDate = await repository.FindByDate(request.Date, cancellationToken);

        if (pageWithTheSameDate is not null)
        {
            return new UpdatePageResponse.PageAlreadyExists();
        }
        
        var page = await repository.FindById(request.Id, cancellationToken);

        if (page is null)
        {
            return new UpdatePageResponse.PageNotFound();
        }
        
        page.Date = request.Date;
        await repository.Update(page, cancellationToken);
        
        return new UpdatePageResponse.Success();
    }
}