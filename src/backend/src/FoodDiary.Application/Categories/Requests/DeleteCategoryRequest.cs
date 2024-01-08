using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Categories.Requests;

public class DeleteCategoryRequest : DeleteEntityRequest<Category>
{
    public DeleteCategoryRequest(Category entity) : base(entity)
    {
    }
}