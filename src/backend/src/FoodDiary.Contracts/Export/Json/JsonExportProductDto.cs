namespace FoodDiary.Contracts.Export.Json;

public class JsonExportProductDto
{
    public string Name { get; init; }

    public int CaloriesCost { get; init; }

    public int DefaultQuantity { get; init; }

    public string Category { get; init; }
}