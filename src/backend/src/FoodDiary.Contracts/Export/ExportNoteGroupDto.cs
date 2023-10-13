namespace FoodDiary.Contracts.Export;

public class ExportNoteGroupDto
{
    public string MealName { get; set; }

    public ExportNoteDto[] Notes { get; set; }

    public int TotalCalories { get; set; }
}