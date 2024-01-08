using FoodDiary.Domain.Enums;
using MediatR;

namespace FoodDiary.Application.Notes.Requests;

public class GetOrderForNewNoteRequest : IRequest<int>
{
    public int PageId { get; set; }

    public MealType MealType { get; set; }

    public GetOrderForNewNoteRequest(int pageId, MealType mealType)
    {
        PageId = pageId;
        MealType = mealType;
    }
}