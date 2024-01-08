using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.ComponentTests.Infrastructure.Google;

public class FakeGoogleDriveClient : IGoogleDriveClient
{
    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken) =>
        Task.CompletedTask;
}