using System.Collections.Generic;
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

    public Task BatchUpdateDocumentAsync(string documentId, IList<Request> requests, string accessToken,
        CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}