using System.Collections.Generic;
using MediatR;

namespace FoodDiary.Application.Abstractions
{
    public abstract class DeleteManyEntitiesRequest<TEntity> : IRequest<int> where TEntity : class
    {
        public IEnumerable<TEntity> Entities { get; set; }

        protected DeleteManyEntitiesRequest(IEnumerable<TEntity> entities)
        {
            Entities = entities;
        }
    }
}
