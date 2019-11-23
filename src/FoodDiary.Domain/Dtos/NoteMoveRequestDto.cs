using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class NoteMoveRequestDto
    {
        public int NoteId { get; set; }

        public MealType DestMeal { get; set; }

        public int Position { get; set; }
    }
}
