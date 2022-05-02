using Google.Apis.Docs.v1.Data;
using File = Google.Apis.Drive.v3.Data.File;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDriveClient
{
    Task<File?> GetFileAsync(string fileId, string accessToken, CancellationToken cancellationToken);

    Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken);
}