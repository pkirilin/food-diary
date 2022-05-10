using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveClient : IGoogleDriveClient
{
    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}