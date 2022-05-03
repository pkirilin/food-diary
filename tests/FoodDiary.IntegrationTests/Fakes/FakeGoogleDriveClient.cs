using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveClient : IGoogleDriveClient
{
    private readonly FakeGoogleDriveStorage _storage;

    public FakeGoogleDriveClient(FakeGoogleDriveStorage storage)
    {
        _storage = storage;
    }

    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        _storage.Save(new FakeGoogleDriveFile
        {
            Id = document.DocumentId
        });
        
        return Task.CompletedTask;
    }
}