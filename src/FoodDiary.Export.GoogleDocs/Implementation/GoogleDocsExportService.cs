using FoodDiary.Domain.Entities;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    private readonly IGoogleDocsClient _docsClient;
    private readonly IGoogleDriveClient _driveClient;

    // private const string ApplicationName = "food-diary";
    // private const string FolderId = "";

    public GoogleDocsExportService(IGoogleDocsClient docsClient, IGoogleDriveClient driveClient)
    {
        _docsClient = docsClient;
        _driveClient = driveClient;
    }
    
    public async Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken)
    {
        var exportDocument = await _docsClient.CreateDocumentAsync("test", accessToken, cancellationToken);
        
        await _driveClient.SaveDocumentAsync(exportDocument, accessToken, cancellationToken);

        // var credential = GoogleCredential.FromAccessToken(accessToken);
        //
        // var docsService = new DocsService(new BaseClientService.Initializer
        // {
        //     HttpClientInitializer = credential,
        //     ApplicationName = ApplicationName
        // });
        //
        // var doc = await docsService.Documents
        //     .Create(new Document { Title = "test" })
        //     .ExecuteAsync(cancellationToken);
        //
        // var driveService = new DriveService(new BaseClientService.Initializer
        // {
        //     HttpClientInitializer = credential,
        //     ApplicationName = ApplicationName
        // });
        //
        // var file = new File
        // {
        //     Name = doc.Title,
        //     Parents = new List<string> { FolderId }
        // };
        //
        // await driveService.Files
        //     .Copy(file, doc.DocumentId)
        //     .ExecuteAsync(cancellationToken);
        //
        // await driveService.Files
        //     .Delete(doc.DocumentId)
        //     .ExecuteAsync(cancellationToken);
    }
}