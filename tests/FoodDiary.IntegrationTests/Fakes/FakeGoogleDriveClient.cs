using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Drive.v3.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveClient : IGoogleDriveClient
{
    public Task<File?> GetFileAsync(string fileId, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }

    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}