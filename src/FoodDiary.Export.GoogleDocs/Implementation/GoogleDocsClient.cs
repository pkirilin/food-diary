using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private const string ApplicationName = "food-diary";

    public async Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);

        var doc = new Document
        {
            Title = title
        };
        
        return await service.Documents
            .Create(doc)
            .ExecuteAsync(cancellationToken);
    }

    public Task BatchUpdateDocumentAsync(string documentId, IList<Request> requests, string accessToken,
        CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        
        var request = new BatchUpdateDocumentRequest
        {
            Requests = requests
        };
        
        return service.Documents
            .BatchUpdate(request, documentId)
            .ExecuteAsync(cancellationToken);
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