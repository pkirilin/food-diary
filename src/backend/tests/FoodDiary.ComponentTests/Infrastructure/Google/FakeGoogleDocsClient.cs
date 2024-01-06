using FoodDiary.Export.GoogleDocs;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.ComponentTests.Infrastructure.Google;

public class FakeGoogleDocsClient : IGoogleDocsClient
{
    private const string NewDocId = "jYUQKkVQhZqJnhxuIZnRifAwwzdcZVtverFAiJgO";

    public Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken) =>
        Task.FromResult(new Document
        {
            DocumentId = NewDocId,
            Title = title
        });

    public Task BatchUpdateDocumentAsync(
        string documentId,
        IList<Request> requests,
        string accessToken,
        CancellationToken cancellationToken) => Task.CompletedTask;
}