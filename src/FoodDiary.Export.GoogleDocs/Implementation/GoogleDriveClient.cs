using Google.Apis.Docs.v1.Data;
using File = Google.Apis.Drive.v3.Data.File;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDriveClient : IGoogleDriveClient
{
    public Task<File?> GetFileAsync(string fileId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}