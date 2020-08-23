using System.Collections.Generic;
using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests
{
    public class DeleteProductsRequest : DeleteManyEntitiesRequest<Product>
    {
        public DeleteProductsRequest(IEnumerable<Product> entities) : base(entities)
        {
        }
    }
}
