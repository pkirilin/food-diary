using FoodDiary.Contracts.Export;
using FoodDiary.Export.GoogleDocs.Builders;
using FoodDiary.Export.GoogleDocs.Contracts;

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
    
    public async Task<string> ExportAsync(ExportRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken))
        {
            throw new InvalidOperationException("Failed to export pages to Google Docs: access_token is empty");
        }
        
        var exportDocument = await _docsClient.CreateDocumentAsync(request.File.FileName,
            request.AccessToken,
            cancellationToken);
        
        var documentBuilder = new DocumentBuilder();
        var pageIndex = 0;

        foreach (var page in request.File.Pages)
        {
            documentBuilder.AddHeader(page.FormattedDate);
            
            var tableBuilder = documentBuilder.StartTable();
            tableBuilder.AddRow(GetTableHeaderRow());
            tableBuilder.SetBoldAndItalic(0, 0, tableBuilder.RowCount, tableBuilder.ColumnCount);

            foreach (var noteGroup in page.NoteGroups)
            {
                var rows = GetNotesTableRows(noteGroup);
                tableBuilder.AddRows(rows);

                if (!noteGroup.Notes.Any())
                    continue;
                
                var groupStartRowIndex = tableBuilder.RowCount - noteGroup.Notes.Length;
                tableBuilder.MergeCells(groupStartRowIndex, 0, noteGroup.Notes.Length, 1);
                tableBuilder.MergeCells(groupStartRowIndex, 4, noteGroup.Notes.Length, 1);
            }
            
            tableBuilder.AddRow(GetTotalCaloriesRow(page.TotalCalories));
            tableBuilder.SetBoldAndItalic(tableBuilder.RowCount - 1, 0, 1, 1);
            tableBuilder.MergeCells(tableBuilder.RowCount - 1, 0, 1, 4);
            tableBuilder.SetColumnWidths(GetTableColumnWidths());
            tableBuilder.EndTable();

            if (pageIndex < request.File.Pages.Length - 1)
                documentBuilder.AddPageBreak();

            pageIndex++;
        }

        var updateRequests = documentBuilder.GetBatchUpdateRequests();
        
        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId,
            updateRequests,
            request.AccessToken,
            cancellationToken);
        
        await _driveClient.SaveDocumentAsync(exportDocument, request.AccessToken, cancellationToken);
        
        return exportDocument.DocumentId;
    }

    private static IEnumerable<string> GetTableHeaderRow() => new[]
    {
        "Прием пищи", "Продукт/блюдо", "Кол-во (г, мл)", "Ккал", "Общее\nкол-во\nкалорий"
    };

    private static IEnumerable<string[]> GetNotesTableRows(ExportNoteGroupDto noteGroup)
    {
        return noteGroup.Notes.Select((note, index) =>
        {
            return new[]
            {
                index == 0 ? noteGroup.MealName : "",
                note.ProductName,
                note.ProductQuantity.ToString(),
                note.Calories.ToString(),
                index == 0 ? noteGroup.TotalCalories.ToString() : ""
            };
        });
    }

    private static IEnumerable<string> GetTotalCaloriesRow(int totalCalories) => new[]
    {
        "Всего за день:", "", "", "", totalCalories.ToString()
    };

    private static IEnumerable<double> GetTableColumnWidths() => new[]
    {
        84.75, 165.75, 85.5, 51, 63.75
    };
}