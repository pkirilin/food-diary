using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Entities
{
    /// <summary>
    /// Diary note. Represents a record on the diary page 
    /// </summary>
    public class Note
    {
        public int Id { get; set; }

        /// <summary>
        /// Meal type for the note. Determines which meal the note belongs to
        /// </summary>
        public MealType MealType { get; set; }

        public int ProductId { get; set; }

        /// <summary>
        /// Quantity of recorded product in grams
        /// </summary>
        public int ProductQuantity { get; set; }

        /// <summary>
        /// Position of the note for displaying on UI
        /// </summary>
        public int DisplayOrder { get; set; }

        public int PageId { get; set; }

        public Page Page { get; set; }

        public Product Product { get; set; }
    }
}
