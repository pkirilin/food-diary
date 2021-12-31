using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests
{
    public class CreateProductRequest : CreateEntityRequest<Product>
    {
        public CreateProductRequest(Product entity) : base(entity)
        {
        }
    }
}
