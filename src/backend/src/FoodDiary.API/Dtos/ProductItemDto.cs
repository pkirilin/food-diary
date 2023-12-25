namespace FoodDiary.API.Dtos;

public class ProductItemDto
{
    public int Id { get; init; }

    public string Name { get; init; }

    public int CaloriesCost { get; init; }

    public int DefaultQuantity { get; init; }

    public int CategoryId { get; init; }

    public string CategoryName { get; init; }
}