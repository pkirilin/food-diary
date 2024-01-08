using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests;

public class EditPageRequest : EditEntityRequest<Page>
{
    public EditPageRequest(Page entity) : base(entity)
    {
    }
}