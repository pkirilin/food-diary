using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Drive.v3.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDriveClient : IGoogleDriveClient
{
    private readonly List<File> _files = new();
    
    public Task<File?> GetFileAsync(string fileId, string accessToken, CancellationToken cancellationToken)
    {
        var file = _files.FirstOrDefault(f => f.Id == fileId);
        
        return Task.FromResult(file);
    }

    public Task SaveDocumentAsync(Document document, string accessToken, CancellationToken cancellationToken)
    {
        _files.Add(new File
        {
            Id = document.DocumentId,
            Name = document.Title
        });
        
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _files.Clear();
    }
}