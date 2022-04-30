using FoodDiary.Domain.Entities;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;

namespace FoodDiary.Export.GoogleDocs;

internal class GoogleDocsExportService : IGoogleDocsExportService
{
    private readonly DocsServiceHttpClientFactory _docsServiceHttpClientFactory;

    public GoogleDocsExportService(DocsServiceHttpClientFactory docsServiceHttpClientFactory)
    {
        _docsServiceHttpClientFactory = docsServiceHttpClientFactory;
    }
    
    public async Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);
        
        var service = new DocsService(new BaseClientService.Initializer
        {
            HttpClientFactory = _docsServiceHttpClientFactory,
            HttpClientInitializer = credential,
            ApplicationName = "food-diary"
        });

        var doc = await service.Documents
            .Create(new Document { Title = "test" })
            .ExecuteAsync(cancellationToken);
        
        throw new System.NotImplementedException();
    }
}