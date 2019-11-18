using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class NoteMoveRequestDto
    {
        public int NoteId { get; set; }

        public MealType NewMeal { get; set; }

        public int DisplayOrder { get; set; }
    }
}
