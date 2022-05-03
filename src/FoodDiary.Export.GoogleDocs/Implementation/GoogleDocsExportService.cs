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
    
    public async Task ExportAsync(GoogleDocsExportData exportData, CancellationToken cancellationToken)
    {
        var title = GenerateExportFileName(exportData.StartDate, exportData.EndDate);
        var exportDocument = await _docsClient.CreateDocumentAsync(title, exportData.AccessToken, cancellationToken);
        
        await _driveClient.SaveDocumentAsync(exportDocument, exportData.AccessToken, cancellationToken);

        foreach (var page in exportData.Pages)
        {
            _docsClient.InsertH1Text(exportDocument, page.Date.ToString("dd.MM.yyyy"));
        }
        
        await _docsClient.BatchUpdateDocumentAsync(exportDocument.DocumentId, cancellationToken);
    }

    private static string GenerateExportFileName(DateTime startDate, DateTime endDate)
    {
        return $"FoodDiary_{startDate:yyyyMMdd}_{endDate:yyyyMMdd}";
    }
}