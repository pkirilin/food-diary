using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using MediatR;

namespace FoodDiary.Application.Notes.Requests
{
    public class GetNotesRequest : IRequest<List<Note>>
    {
        public int PageId { get; set; }

        public MealType? MealType { get; set; }

        public GetNotesRequest(int pageId, MealType? mealType)
        {
            PageId = pageId;
            MealType = mealType;
        }
    }
}
