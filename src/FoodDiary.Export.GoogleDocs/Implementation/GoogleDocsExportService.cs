using FoodDiary.Contracts.Export;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    private readonly IGoogleDocsClient _docsClient;
    private readonly IGoogleDriveClient _driveClient;

    public GoogleDocsExportService(IGoogleDocsClient docsClient, IGoogleDriveClient driveClient)
    {
        _docsClient = docsClient;
        _driveClient = driveClient;
    }
    
    public async Task<string> ExportAsync(ExportFileDto exportFileDto, string accessToken,
        CancellationToken cancellationToken)
    {
        var exportDocument = await _docsClient.CreateDocumentAsync(exportFileDto.FileName, accessToken, cancellationToken);
        var documentUpdates = new DocumentUpdatesBuilder();
        var pageIndex = 0;

        foreach (var page in exportFileDto.Pages)
        {
            var cells = new List<List<TableCell>> { GetTableHeaderCells() };
            var mergeCellsInfo = new List<MergeTableCellsData>();

            foreach (var noteGroup in page.NoteGroups)
            {
                var noteIndex = 0;
                
                foreach (var note in noteGroup.Notes)
                {
                    cells.Add(new List<TableCell>
                    {
                        new() { Text = noteIndex == 0 ? noteGroup.MealName : "" },
                        new() { Text = note.ProductName },
                        new() { Text = note.ProductQuantity.ToString() },
                        new() { Text = note.Calories.ToString() },
                        new() { Text = noteIndex == 0 ? noteGroup.TotalCalories.ToString() : "" }
                    });

                    noteIndex++;
                }

                if (!noteGroup.Notes.Any())
                    continue;
                
                var groupStartRowIndex = cells.Count - noteGroup.Notes.Length;

                mergeCellsInfo.AddRange(new []
                {
                    new MergeTableCellsData
                    {
                        RowIndex = groupStartRowIndex,
                        ColumnIndex = 0,
                        RowSpan = noteGroup.Notes.Length,
                        ColumnSpan = 1
                    },
                    new MergeTableCellsData
                    {
                        RowIndex = groupStartRowIndex,
                        ColumnIndex = 4,
                        RowSpan = noteGroup.Notes.Length,
                        ColumnSpan = 1
                    }
                });
            }
            
            cells.Add(GetTotalCaloriesCells(page.TotalCalories));
            
            mergeCellsInfo.Add(new MergeTableCellsData
            {
                RowIndex = cells.Count - 1,
                ColumnIndex = 0,
                RowSpan = 1,
                ColumnSpan = 4
            });
            
            documentUpdates.AddHeader(page.FormattedDate);
            
            documentUpdates.AddTable(new InsertTableOptions
            {
                Cells = cells,
                MergeCellsInfo = mergeCellsInfo,
                ColumnWidths = GetTableColumnWidths()
            });
            
            if (pageIndex < exportFileDto.Pages.Length - 1)
                documentUpdates.AddPageBreak();

            pageIndex++;
        }

        var updateRequests = documentUpdates.GetBatchUpdateRequests();
        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId, updateRequests, accessToken, cancellationToken);
        await _driveClient.SaveDocumentAsync(exportDocument, accessToken, cancellationToken);
        
        return exportDocument.DocumentId;
    }

    private static List<TableCell> GetTableHeaderCells()
    {
        var texts = new[] { "Прием пищи", "Продукт/блюдо", "Кол-во (г, мл)", "Ккал", "Общее\nкол-во\nкалорий" };
        
        return texts.Select(text => new TableCell
        {
            Text = text,
            IsBold = true,
            IsItalic = true
        }).ToList();
    }

    private static List<TableCell> GetTotalCaloriesCells(int totalCalories)
    {
        var texts = new[] { "Всего за день:", "", "", "", totalCalories.ToString() };

        return texts.Select(text => new TableCell
        {
            Text = text,
            IsBold = true,
            IsItalic = true
        }).ToList();
    }

    private static List<double> GetTableColumnWidths()
    {
        return new List<double> { 84.75, 165.75, 85.5, 51, 63.75 };
    }
}