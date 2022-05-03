using Google.Apis.Docs.v1.Data;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDriveClient
{
    Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken);
}