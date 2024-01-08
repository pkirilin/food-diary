using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Categories.Requests;

public class EditCategoryRequest : EditEntityRequest<Category>
{
    public EditCategoryRequest(Category entity) : base(entity)
    {
    }
}