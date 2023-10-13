namespace FoodDiary.Contracts.Export;

public class ExportNoteDto
{
    public string ProductName { get; set; }

    public int ProductQuantity { get; set; }

    public int Calories { get; set; }
}