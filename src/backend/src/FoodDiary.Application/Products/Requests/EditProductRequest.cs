using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests;

public class EditProductRequest : EditEntityRequest<Product>
{
    public EditProductRequest(Product entity) : base(entity)
    {
    }
}