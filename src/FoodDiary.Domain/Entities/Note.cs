using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Entities
{
    public class Note
    {
        public int Id { get; set; }

        public MealType MealType { get; set; }

        public int ProductId { get; set; }

        public int ProductQuantity { get; set; }

        public int DisplayOrder { get; set; }

        public int PageId { get; set; }

        public Page Page { get; set; }

        public Product Product { get; set; }
    }
}
