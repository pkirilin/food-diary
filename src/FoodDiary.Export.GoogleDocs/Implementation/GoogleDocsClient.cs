using Google.Apis.Docs.v1.Data;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    public Task<Document?> GetDocumentAsync(string? documentId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}