using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests;

public class DeleteProductRequest : DeleteEntityRequest<Product>
{
    public DeleteProductRequest(Product entity) : base(entity)
    {
    }
}