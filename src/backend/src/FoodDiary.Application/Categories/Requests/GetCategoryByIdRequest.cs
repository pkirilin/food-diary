using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Categories.Requests;

public class GetCategoryByIdRequest : GetEntityByIdRequest<Category>
{
    public GetCategoryByIdRequest(int id) : base(id)
    {
    }
}