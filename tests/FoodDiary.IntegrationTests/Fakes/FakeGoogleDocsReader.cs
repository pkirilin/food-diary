using System;
using System.Collections.Generic;
using System.Linq;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsReader : IDisposable
{
    private readonly Dictionary<string, List<string>> _headers = new();

    public void LoadTitle(string documentId, string title)
    {
        if (!_headers.ContainsKey(documentId))
        {
            _headers.Add(documentId, new List<string> { title });
            return;
        }
        
        _headers[documentId].Add(title);
    }
    
    public IEnumerable<string> GetHeaders(string? documentId)
    {
        if (documentId == null)
            return Enumerable.Empty<string>();

        return _headers.ContainsKey(documentId)
            ? _headers[documentId]
            : Enumerable.Empty<string>();
    }

    public void Dispose()
    {
        _headers.Clear();
    }
}