using MediatR;

namespace FoodDiary.Application.Abstractions;

public abstract class DeleteEntityRequest<TEntity> : IRequest<int> where TEntity : class
{
    public TEntity Entity { get; set; }

    protected DeleteEntityRequest(TEntity entity)
    {
        Entity = entity;
    }
}