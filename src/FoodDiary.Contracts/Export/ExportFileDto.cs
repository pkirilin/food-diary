namespace FoodDiary.Contracts.Export;

public class ExportFileDto
{
    public string FileName { get; set; }
    
    public ExportPageDto[] Pages { get; set; }
}