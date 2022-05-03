using System;
using System.Collections.Generic;
using System.Linq;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsStorage : IDisposable
{
    private readonly List<FakeGoogleDocument> _fakeDocuments = new();

    public FakeGoogleDocument? Get(string? documentId)
    {
        return _fakeDocuments.FirstOrDefault(d => d.Id == documentId);
    }
    
    public void Save(Document document)
    {
        _fakeDocuments.Add(new FakeGoogleDocument
        {
            Id = document.DocumentId,
            Title = document.Title
        });
    }

    public void Dispose()
    {
        _fakeDocuments.Clear();
    }
}