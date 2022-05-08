using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsClient : IGoogleDocsClient
{
    public const string NewDocId = "mTruDIuO4GigKXm0";

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var document = new Document
        {
            DocumentId = NewDocId,
            Title = title
        };
        
        return Task.FromResult(document);
    }

    public void InsertH1Text(Document document, string text)
    {
    }

    public void InsertTable(Document document, InsertTableOptions options)
    {
    }

    public void InsertPageBreak(Document document)
    {
    }

    public Task BatchUpdateDocumentAsync(string documentId, string accessToken, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}