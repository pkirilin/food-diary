using Google.Apis.Docs.v1.Data;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsClient
{
    Task<Document?> GetDocumentAsync(string? documentId, CancellationToken cancellationToken);

    Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken);
}