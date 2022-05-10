using Google.Apis.Docs.v1.Data;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsClient
{
    Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken);

    Task BatchUpdateDocumentAsync(string documentId,
        IList<Request> requests,
        string accessToken,
        CancellationToken cancellationToken);
}