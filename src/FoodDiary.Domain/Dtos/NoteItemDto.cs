namespace FoodDiary.Domain.Dtos
{
    public class NoteItemDto
    {
        public int Id { get; set; }

        public int DisplayOrder { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; }

        public int ProductQuantity { get; set; }

        public int Calories { get; set; }
    }
}
