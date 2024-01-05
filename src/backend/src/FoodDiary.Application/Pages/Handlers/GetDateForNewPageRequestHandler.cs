using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Abstractions;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Repositories;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers;

[UsedImplicitly]
internal class GetDateForNewPageRequestHandler : IRequestHandler<GetDateForNewPageRequest, DateTime>
{
    private readonly IPageRepository _pageRepository;
    private readonly IDateTimeProvider _dateTimeProvider;

    public GetDateForNewPageRequestHandler(IPageRepository pageRepository, IDateTimeProvider dateTimeProvider)
    {
        _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        _dateTimeProvider = dateTimeProvider;
    }

    public async Task<DateTime> Handle(GetDateForNewPageRequest request, CancellationToken cancellationToken)
    {
        var query = _pageRepository.GetQueryWithoutTracking()
            .OrderByDescending(p => p.Date)
            .Take(1);

        var pages = await _pageRepository.GetByQueryAsync(query, cancellationToken);

        return pages.FirstOrDefault()?.Date.AddDays(1) ?? _dateTimeProvider.Now.Date;
    }
}