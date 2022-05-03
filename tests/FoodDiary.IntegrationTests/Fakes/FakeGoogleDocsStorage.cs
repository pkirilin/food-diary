using System;
using System.Collections.Generic;
using System.Linq;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsStorage : IDisposable
{
    private readonly List<FakeGoogleDocument> _fakeDocuments = new();

    public FakeGoogleDocument? GetDocument(string? documentId)
    {
        return _fakeDocuments.FirstOrDefault(d => d.Id == documentId);
    }
    
    public void Save(FakeGoogleDocument document)
    {
        _fakeDocuments.Add(document);
    }

    public void Dispose()
    {
        _fakeDocuments.Clear();
    }
}