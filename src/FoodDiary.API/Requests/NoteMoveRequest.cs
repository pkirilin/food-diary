using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Requests
{
    public class NoteMoveRequest
    {
        [Range(1, Int32.MaxValue)]
        public int NoteId { get; set; }

        [EnumDataType(typeof(MealType))]
        public MealType DestMeal { get; set; }

        public int Position { get; set; }
    }
}
