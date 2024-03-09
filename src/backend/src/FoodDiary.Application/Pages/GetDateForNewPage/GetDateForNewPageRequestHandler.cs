using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.GetDateForNewPage;

public record GetDateForNewPageRequest : IRequest<GetDateForNewPageResult>;

public abstract record GetDateForNewPageResult
{
    public record Success(DateOnly Date) : GetDateForNewPageResult;
}

[UsedImplicitly]
internal class GetDateForNewPageRequestHandler(
    IPagesRepository repository,
    TimeProvider timeProvider) : IRequestHandler<GetDateForNewPageRequest, GetDateForNewPageResult>
{
    public async Task<GetDateForNewPageResult> Handle(
        GetDateForNewPageRequest request,
        CancellationToken cancellationToken)
    {
        var lastPage = await repository.FindLast(cancellationToken);
        var date = lastPage?.Date.AddDays(1) ?? DateOnly.FromDateTime(timeProvider.GetUtcNow().Date);
        return new GetDateForNewPageResult.Success(date);
    }
}