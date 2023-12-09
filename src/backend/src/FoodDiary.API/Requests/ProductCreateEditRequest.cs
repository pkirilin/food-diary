using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Requests
{
    public class ProductCreateEditRequest
    {
        [Required(ErrorMessage = "Product name is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Product name must be between 3 and 100 characters")]
        public string Name { get; set; }

        [Range(1, 1000, ErrorMessage = "Calories cost value must be between 1 and 1000")]
        public double CaloriesCost { get; set; }

        [Range(1, Int32.MaxValue)]
        public int CategoryId { get; set; }
    }
}
