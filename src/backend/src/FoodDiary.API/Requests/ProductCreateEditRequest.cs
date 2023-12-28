using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Requests;

public class ProductCreateEditRequest
{
    [Required(ErrorMessage = "Product name is required")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Product name must be between 3 and 100 characters")]
    public string Name { get; init; }

    [Range(1, 1000, ErrorMessage = "Calories cost value must be between 1 and 1000")]
    public int CaloriesCost { get; init; }

    [Range(10, 1000, ErrorMessage = "Default quantity must be between 10 and 1000 cal")]
    public int DefaultQuantity { get; init; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; init; }
}