using FoodDiary.Domain.Entities;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using File = Google.Apis.Drive.v3.Data.File;

namespace FoodDiary.Export.GoogleDocs;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    private const string ApplicationName = "food-diary";
    // TODO: move to secrets
    private const string FolderId = "";
    
    private readonly DocsServiceHttpClientFactory _docsServiceHttpClientFactory;
    private readonly DriveServiceHttpClientFactory _driveServiceHttpClientFactory;

    public GoogleDocsExportService(DocsServiceHttpClientFactory docsServiceHttpClientFactory,
        DriveServiceHttpClientFactory driveServiceHttpClientFactory)
    {
        _docsServiceHttpClientFactory = docsServiceHttpClientFactory;
        _driveServiceHttpClientFactory = driveServiceHttpClientFactory;
    }
    
    public async Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        
        var docsService = new DocsService(new BaseClientService.Initializer
        {
            HttpClientFactory = _docsServiceHttpClientFactory,
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName
        });

        var doc = await docsService.Documents
            .Create(new Document { Title = "test" })
            .ExecuteAsync(cancellationToken);

        var driveService = new DriveService(new BaseClientService.Initializer
        {
            HttpClientFactory = _driveServiceHttpClientFactory,
            HttpClientInitializer = credential,
            ApplicationName = ApplicationName
        });

        var file = new File
        {
            Name = doc.Title,
            Parents = new List<string> { FolderId }
        };

        await driveService.Files
            .Copy(file, doc.DocumentId)
            .ExecuteAsync(cancellationToken);
        
        await driveService.Files
            .Delete(doc.DocumentId)
            .ExecuteAsync(cancellationToken);
    }
}