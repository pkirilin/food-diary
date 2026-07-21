namespace FoodDiary.API.Dtos;

public class CategoryItemDto
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public int CountProducts { get; set; }
}