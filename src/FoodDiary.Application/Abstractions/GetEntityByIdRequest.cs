using MediatR;

namespace FoodDiary.Application.Abstractions
{
    public abstract class GetEntityByIdRequest<TEntity> : IRequest<TEntity> where TEntity : class
    {
        public int Id { get; set; }
    }
}
