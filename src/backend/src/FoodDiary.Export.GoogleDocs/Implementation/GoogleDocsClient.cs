using FoodDiary.Configuration;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;
using Microsoft.Extensions.Options;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private readonly IOptions<GoogleOptions> _options;

    public GoogleDocsClient(IOptions<GoogleOptions> options)
    {
        _options = options;
    }
    
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

    private DocsService CreateService(string accessToken)
    {
        return new DocsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = _options.Value.ApplicationName
        });
    }
}