using Google.Apis.Docs.v1.Data;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsClient
{
    Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken);

    void InsertH1Text(Document document, string text);

    void InsertTable(Document document, InsertTableOptions options);
    
    Task BatchUpdateDocumentAsync(string documentId, CancellationToken cancellationToken);
}