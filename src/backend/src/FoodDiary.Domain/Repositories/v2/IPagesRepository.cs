using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

#nullable enable

namespace FoodDiary.Domain.Repositories.v2;

public record FindWithTotalCountResult(IReadOnlyList<Page> FoundPages, long TotalCount);

public interface IPagesRepository
{
    Task<IReadOnlyList<Page>> Find(
        Func<IQueryable<Page>, IQueryable<Page>> buildQuery,
        CancellationToken cancellationToken);

    Task<FindWithTotalCountResult> FindWithTotalCount(
        Func<IQueryable<Page>, IQueryable<Page>> buildQuery,
        CancellationToken cancellationToken);
    
    Task<Page?> FindById(int id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Page>> FindByIds(IReadOnlyList<int> ids, CancellationToken cancellationToken);
    Task<Page?> FindByDate(DateOnly date, CancellationToken cancellationToken);
    Task<Page?> FindLast(CancellationToken cancellationToken);

    Task<int> Create(Page page, CancellationToken cancellationToken);
    Task Update(Page page, CancellationToken cancellationToken);
    Task Delete(Page page, CancellationToken cancellationToken);
    Task Delete(IEnumerable<Page> pages, CancellationToken cancellationToken);
}