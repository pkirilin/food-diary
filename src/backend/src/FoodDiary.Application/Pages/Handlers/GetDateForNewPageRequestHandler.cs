using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers;

[UsedImplicitly]
internal class GetDateForNewPageRequestHandler(IPageRepository pageRepository, TimeProvider timeProvider)
    : IRequestHandler<GetDateForNewPageRequest, DateTime>
{
    public async Task<DateTime> Handle(GetDateForNewPageRequest request, CancellationToken cancellationToken)
    {
        var query = pageRepository.GetQueryWithoutTracking()
            .OrderByDescending(p => p.Date)
            .Take(1);

        var pages = await pageRepository.GetByQueryAsync(query, cancellationToken);

        return pages.FirstOrDefault()?.Date.AddDays(1) ?? timeProvider.GetUtcNow().Date;
    }
}