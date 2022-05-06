namespace FoodDiary.Export.GoogleDocs;

public class MergeTableCellsData
{
    public int RowIndex { get; init; }

    public int ColumnIndex { get; init; }
    
    public int RowSpan { get; init; }
    
    public int ColumnSpan { get; init; }
}