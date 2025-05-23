namespace FoodDiary.API.Dtos;

public class ProductItemDto
{
    public int Id { get; init; }

    public string Name { get; init; }

    public int CaloriesCost { get; init; }

    public int DefaultQuantity { get; init; }

    public int CategoryId { get; init; }

    public string CategoryName { get; init; }
    
    public required decimal? Protein { get; init; }
    public required decimal? Fats { get; init; }
    public required decimal? Carbs { get; init; }
    public required decimal? Sugar { get; init; }
    public required decimal? Salt { get; init; }
}