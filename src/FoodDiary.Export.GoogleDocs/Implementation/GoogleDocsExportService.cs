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

            if (pageIndex < exportFileDto.Pages.Length - 1)
                documentBuilder.AddPageBreak();

            pageIndex++;
        }

        var updateRequests = documentBuilder.GetBatchUpdateRequests();
        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId, updateRequests, accessToken, cancellationToken);
        await _driveClient.SaveDocumentAsync(exportDocument, accessToken, cancellationToken);
        
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