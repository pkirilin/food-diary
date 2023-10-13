namespace FoodDiary.Contracts.Export;

public class ExportPageDto
{
    public string FormattedDate { get; set; }

    public ExportNoteGroupDto[] NoteGroups { get; set; }

    public int TotalCalories { get; set; }
}