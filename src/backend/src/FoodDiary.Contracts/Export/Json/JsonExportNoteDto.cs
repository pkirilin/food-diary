namespace FoodDiary.Contracts.Export.Json;

public class JsonExportNoteDto
{
    public int MealType { get; set; }

    public JsonExportProductDto Product { get; set; }

    public int ProductQuantity { get; set; }

    public int DisplayOrder { get; set; }
}