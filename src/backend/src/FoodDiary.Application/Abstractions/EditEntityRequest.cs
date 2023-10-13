using MediatR;

namespace FoodDiary.Application.Abstractions
{
    public abstract class EditEntityRequest<TEntity> : IRequest<int> where TEntity : class
    {
        public TEntity Entity { get; set; }

        protected EditEntityRequest(TEntity entity)
        {
            Entity = entity;
        }
    }
}
