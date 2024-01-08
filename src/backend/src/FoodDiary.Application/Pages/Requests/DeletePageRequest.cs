using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Pages.Requests;

public class DeletePageRequest : DeleteEntityRequest<Page>
{
    public DeletePageRequest(Page entity) : base(entity)
    {
    }
}