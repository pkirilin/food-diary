using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class CategoryCreateEditDto
    {
        [Required(ErrorMessage = "Category name is required")]
        [StringLength(64, MinimumLength = 4, ErrorMessage = "Category name must be between 4 and 64 characters")]
        public string Name { get; set; }
    }
}
