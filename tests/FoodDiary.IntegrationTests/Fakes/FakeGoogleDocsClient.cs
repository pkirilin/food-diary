using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsClient : IGoogleDocsClient
{
    private readonly FakeGoogleDocsStorage _storage;

    public const string NewDocId = "mTruDIuO4GigKXm0";

    public FakeGoogleDocsClient(FakeGoogleDocsStorage storage)
    {
        _storage = storage;
    }

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var document = new Document
        {
            DocumentId = NewDocId,
            Title = title
        };
        
        _storage.Save(document);
        
        return Task.FromResult(document);
    }

    public void InsertH1Text(Document document, string text)
    {
        var fakeDoc = _storage.Get(document.DocumentId);
        fakeDoc?.RenderHeader(text);
    }

    public Task BatchUpdateDocumentAsync(string documentId, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}