using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class ProductCreateEditDto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Product name is required")]
        [StringLength(64, MinimumLength = 4, ErrorMessage = "Product name must be between 4 and 64 characters")]
        public string Name { get; set; }

        [Range(1, 1000, ErrorMessage = "Calories cost value must be between 1 and 1000")]
        public double CaloriesCost { get; set; }

        [Range(1, Int32.MaxValue)]
        public int CategoryId { get; set; }
    }
}
