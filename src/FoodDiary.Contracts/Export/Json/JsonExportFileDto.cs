namespace FoodDiary.Contracts.Export.Json
{
    public class JsonExportFileDto
    {
        public IEnumerable<JsonExportPageDto> Pages { get; set; }
    }
}
