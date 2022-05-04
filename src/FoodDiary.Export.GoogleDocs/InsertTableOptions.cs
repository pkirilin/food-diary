namespace FoodDiary.Export.GoogleDocs;

public class InsertTableOptions
{
    public string[][] Cells { get; set; } = new string[0][];

    public (int, int)[][] MergedCells { get; set; } = new (int, int)[0][];
}