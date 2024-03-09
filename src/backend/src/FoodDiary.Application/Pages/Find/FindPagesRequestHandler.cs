using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories.v2;
using JetBrains.Annotations;
using MediatR;

namespace FoodDiary.Application.Pages.Find;

public record FindPagesRequest(
    SortOrder SortOrder,
    DateOnly? StartDate,
    DateOnly? EndDate,
    int PageNumber,
    int PageSize) : IRequest<FindPagesResponse>;

public abstract record FindPagesResponse
{
    public record StartDateIsGreaterThanEndDate : FindPagesResponse;
    public record Success(IReadOnlyList<Page> FoundPages, long TotalPagesCount) : FindPagesResponse;
}

[UsedImplicitly]
internal class FindPagesRequestHandler(
    IPagesRepository repository) : IRequestHandler<FindPagesRequest, FindPagesResponse>
{
    public async Task<FindPagesResponse> Handle(FindPagesRequest request, CancellationToken cancellationToken)
    {
        if (request.StartDate > request.EndDate)
        {
            return new FindPagesResponse.StartDateIsGreaterThanEndDate();
        }
        
        var (foundPages, totalPagesCount) = await repository.FindWithTotalCount(
            pages => BuildQuery(request, pages),
            cancellationToken);
        
        return new FindPagesResponse.Success(foundPages, totalPagesCount);
    }

    private static IQueryable<Page> BuildQuery(FindPagesRequest request, IQueryable<Page> query)
    {
        if (request.StartDate.HasValue)
            query = query.Where(p => p.Date >= request.StartDate);
        if (request.EndDate.HasValue)
            query = query.Where(p => p.Date <= request.EndDate);
        
        query = request.SortOrder == SortOrder.Ascending
            ? query.OrderBy(p => p.Date)
            : query.OrderByDescending(p => p.Date);
        
        query = query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

        return query;
    }
}