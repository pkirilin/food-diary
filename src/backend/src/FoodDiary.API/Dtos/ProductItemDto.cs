namespace FoodDiary.API.Dtos
{
    public class ProductItemDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public double CaloriesCost { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; }
    }
}
