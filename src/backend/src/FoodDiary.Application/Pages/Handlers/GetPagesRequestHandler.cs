using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Models;
using FoodDiary.Application.Pages.Requests;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using MediatR;

namespace FoodDiary.Application.Pages.Handlers;

class GetPagesRequestHandler : IRequestHandler<GetPagesRequest, PagesSearchResult>
{
    private readonly IPageRepository _pageRepository;

    public GetPagesRequestHandler(IPageRepository pageRepository)
    {
        _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
    }

    public async Task<PagesSearchResult> Handle(GetPagesRequest request, CancellationToken cancellationToken)
    {
        var query = _pageRepository.GetQueryWithoutTracking();

        if (request.StartDate.HasValue)
            query = query.Where(p => p.Date >= request.StartDate);
        if (request.EndDate.HasValue)
            query = query.Where(p => p.Date <= request.EndDate);

        query = request.SortOrder == SortOrder.Ascending ? query.OrderBy(p => p.Date) : query.OrderByDescending(p => p.Date);
        query = _pageRepository.LoadNotesWithProductsAndCategories(query);

        var totalPagesCount = await _pageRepository.CountByQueryAsync(query, cancellationToken);

        query = query.Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        var foundPages = await _pageRepository.GetByQueryAsync(query, cancellationToken);
            
        return new PagesSearchResult()
        {
            FoundPages = foundPages,
            TotalPagesCount = totalPagesCount
        };
    }
}