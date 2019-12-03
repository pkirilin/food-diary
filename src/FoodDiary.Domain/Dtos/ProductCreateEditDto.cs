using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class ProductCreateEditDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public double CaloriesCost { get; set; }

        public int CategoryId { get; set; }
    }
}
