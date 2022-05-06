namespace FoodDiary.Export.GoogleDocs;

public class InsertTableOptions
{
    public List<List<TableCell>> Cells { get; init; } = new();

    public List<MergeTableCellsData> MergeCellsInfo { get; init; } = new();
}