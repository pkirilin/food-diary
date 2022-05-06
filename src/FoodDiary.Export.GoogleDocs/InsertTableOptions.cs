namespace FoodDiary.Export.GoogleDocs;

public class InsertTableOptions
{
    public List<List<string>> Cells { get; init; } = new();

    public List<MergeTableCellsData> MergeCellsInfo { get; init; } = new();
}