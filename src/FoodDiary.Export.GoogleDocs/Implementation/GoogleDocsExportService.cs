using FoodDiary.Domain.Entities;

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
    
    public async Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken)
    {
        var exportDocument = await _docsClient.CreateDocumentAsync("test", accessToken, cancellationToken);
        
        await _driveClient.SaveDocumentAsync(exportDocument, accessToken, cancellationToken);
    }
}