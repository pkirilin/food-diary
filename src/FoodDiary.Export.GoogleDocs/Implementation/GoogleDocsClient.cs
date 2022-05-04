using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private const string ApplicationName = "food-diary";

    private readonly List<Request> _batchUpdateRequests = new();

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        
        var doc = new Document
        {
            Title = title
        };
        
        return service.Documents
            .Create(doc)
            .ExecuteAsync(cancellationToken);
    }

    public void InsertH1Text(Document document, string text)
    {
        throw new NotImplementedException();
    }

    public void InsertTable(Document document, InsertTableOptions options)
    {
        throw new NotImplementedException();
    }

    public async Task BatchUpdateDocumentAsync(string documentId, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        var request = new BatchUpdateDocumentRequest { Requests = _batchUpdateRequests };
        
        await service.Documents
            .BatchUpdate(request, documentId)
            .ExecuteAsync(cancellationToken);
        
        _batchUpdateRequests.Clear();
    }

    private static DocsService CreateService(string accessToken)
    {
        return new DocsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = ApplicationName
        });
    }
}