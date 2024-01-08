using System.Collections.Generic;
using MediatR;

namespace FoodDiary.Application.Abstractions;

public abstract class GetEntitiesByIdsRequest<TEntity> : IRequest<List<TEntity>> where TEntity : class
{
    public IEnumerable<int> Ids { get; set; }

    protected GetEntitiesByIdsRequest(IEnumerable<int> ids)
    {
        Ids = ids;
    }
}