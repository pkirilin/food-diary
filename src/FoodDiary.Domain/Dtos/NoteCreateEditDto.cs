using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class NoteCreateEditDto
    {
        public int Id { get; set; }

        public MealType MealType { get; set; }

        public int ProductId { get; set; }

        public int PageId { get; set; }

        public int ProductQuantity { get; set; }
    }
}
