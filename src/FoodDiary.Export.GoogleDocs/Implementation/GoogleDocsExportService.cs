using FoodDiary.Contracts.Export;
using FoodDiary.Export.GoogleDocs.Builders;

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
        var documentBuilder = new DocumentBuilder();
        var pageIndex = 0;

        foreach (var page in exportFileDto.Pages)
        {
            documentBuilder.AddHeader(page.FormattedDate);
            
            var tableBuilder = documentBuilder.AddTable();
            tableBuilder.AddRow(GetTableHeaderCells().Select(c => c.Text));
            tableBuilder.SetBoldAndItalic(0, 0, tableBuilder.RowCount, tableBuilder.ColumnCount);

            foreach (var noteGroup in page.NoteGroups)
            {
                var noteIndex = 0;
                
                foreach (var note in noteGroup.Notes)
                {
                    tableBuilder.AddRow(new []
                    {
                        noteIndex == 0 ? noteGroup.MealName : "",
                        note.ProductName,
                        note.ProductQuantity.ToString(),
                        note.Calories.ToString(),
                        noteIndex == 0 ? noteGroup.TotalCalories.ToString() : ""
                    });

                    noteIndex++;
                }

                if (!noteGroup.Notes.Any())
                    continue;
                
                var groupStartRowIndex = tableBuilder.RowCount - noteGroup.Notes.Length;
                
                tableBuilder.MergeCells(groupStartRowIndex, 0, noteGroup.Notes.Length, 1);
                tableBuilder.MergeCells(groupStartRowIndex, 4, noteGroup.Notes.Length, 1);
            }
            
            tableBuilder.AddRow(GetTotalCaloriesCells(page.TotalCalories).Select(c => c.Text));
            tableBuilder.SetBoldAndItalic(tableBuilder.RowCount- 1, 0, 1, 1);
            tableBuilder.MergeCells(tableBuilder.RowCount - 1, 0, 1, 4);
            tableBuilder.SetColumnWidths(GetTableColumnWidths());
            tableBuilder.AttachToDocument();

            if (pageIndex < exportFileDto.Pages.Length - 1)
                documentBuilder.AddPageBreak();

            pageIndex++;
        }

        var updateRequests = documentBuilder.GetBatchUpdateRequests();
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