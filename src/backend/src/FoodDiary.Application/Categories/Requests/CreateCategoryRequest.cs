using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Categories.Requests
{
    public class CreateCategoryRequest : CreateEntityRequest<Category>
    {
        public CreateCategoryRequest(Category entity) : base(entity)
        {
        }
    }
}
