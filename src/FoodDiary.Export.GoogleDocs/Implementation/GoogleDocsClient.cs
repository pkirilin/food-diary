using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private const string ApplicationName = "food-diary";

    private readonly List<Request> _batchUpdateRequests = new();
    private int _currentLocationIndex = 1;

    public async Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);

        var doc = new Document
        {
            Title = title
        };
        
        return await service.Documents
            .Create(doc)
            .ExecuteAsync(cancellationToken);
    }

    public void InsertH1Text(Document document, string text)
    {
        _batchUpdateRequests.Add(new Request
        {
            InsertText = new InsertTextRequest
            {
                Text = text,
                Location = new Location { Index = _currentLocationIndex }
            }
        });
        
        _currentLocationIndex += text.Length;
    }

    public void InsertTable(Document document, InsertTableOptions options)
    {
        _batchUpdateRequests.Add(new Request
        {
            InsertTable = new InsertTableRequest
            {
                Rows = options.Cells.Count,
                Columns = options.Cells.Max(c => c.Count),
                Location = new Location { Index = _currentLocationIndex }
            }
        });
        
        _currentLocationIndex++;

        foreach (var row in options.Cells)
        {
            _currentLocationIndex++;
            
            foreach (var cellText in row)
            {
                _currentLocationIndex += 2;

                if (!string.IsNullOrWhiteSpace(cellText))
                {
                    _batchUpdateRequests.Add(new Request
                    {
                        InsertText = new InsertTextRequest
                        {
                            Text = cellText,
                            Location = new Location { Index = _currentLocationIndex }
                        }
                    });

                    _currentLocationIndex += cellText.Length;
                }
            }
        }

        _currentLocationIndex += 2;
    }

    public void InsertPageBreak(Document document)
    {
        _batchUpdateRequests.Add(new Request
        {
            InsertPageBreak = new InsertPageBreakRequest
            {
                Location = new Location { Index = _currentLocationIndex }
            }
        });
        
        _currentLocationIndex++;
    }

    public async Task BatchUpdateDocumentAsync(string documentId, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        var request = new BatchUpdateDocumentRequest { Requests = _batchUpdateRequests };
        
        await service.Documents
            .BatchUpdate(request, documentId)
            .ExecuteAsync(cancellationToken);
        
        _batchUpdateRequests.Clear();
        _currentLocationIndex = 1;
    }

    private static DocsService CreateService(string accessToken)
    {
        return new DocsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = ApplicationName
        });
    }
}