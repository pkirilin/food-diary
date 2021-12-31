using FoodDiary.Domain.Enums;

namespace FoodDiary.Import.Models
{
    public class NoteJsonItem
    {
        public MealType MealType { get; set; }

        public ProductJsonItem Product { get; set; }

        public int ProductQuantity { get; set; }

        public int DisplayOrder { get; set; }
    }
}
