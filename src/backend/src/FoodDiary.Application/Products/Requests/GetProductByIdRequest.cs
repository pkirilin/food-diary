using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Products.Requests;

public class GetProductByIdRequest : GetEntityByIdRequest<Product>
{
    public GetProductByIdRequest(int id) : base(id)
    {
    }
}