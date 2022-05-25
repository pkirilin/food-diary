namespace FoodDiary.Contracts.Export.Json
{
    public class JsonExportPageDto
    {
        public DateTime Date { get; set; }

        public IEnumerable<JsonExportNoteDto> Notes { get; set; }
    }
}
