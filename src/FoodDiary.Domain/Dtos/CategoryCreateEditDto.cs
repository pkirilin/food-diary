using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class CategoryCreateEditDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }
    }
}
