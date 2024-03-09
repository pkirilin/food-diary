namespace FoodDiary.Contracts.Export.Json;

public class JsonExportPageDto
{
    public DateOnly Date { get; set; }

    public IEnumerable<JsonExportNoteDto> Notes { get; set; }
}