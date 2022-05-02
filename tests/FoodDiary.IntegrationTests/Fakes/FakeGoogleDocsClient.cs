using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsClient : IGoogleDocsClient
{
    public Task<Document?> GetDocumentAsync(string? documentId, string accessToken, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}