using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private const string ApplicationName = "food-diary";
    
    public Task<Document?> GetDocumentAsync(string? documentId, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);

        return service.Documents
            .Get(documentId)
            .ExecuteAsync(cancellationToken);
    }

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
    
    private static DocsService CreateService(string accessToken)
    {
        return new DocsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = ApplicationName
        });
    }
}