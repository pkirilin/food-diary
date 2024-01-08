using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests;

public class CreatePageRequest : CreateEntityRequest<Page>
{
    public CreatePageRequest(Page entity) : base(entity)
    {
    }
}