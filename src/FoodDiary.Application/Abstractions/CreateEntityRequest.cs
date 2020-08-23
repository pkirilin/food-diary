using MediatR;

namespace FoodDiary.Application.Abstractions
{
    public abstract class CreateEntityRequest<TEntity> : IRequest<TEntity> where TEntity : class
    {
        public TEntity Entity { get; set; }

        protected CreateEntityRequest(TEntity entity)
        {
            Entity = entity;
        }
    }
}
