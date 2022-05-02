using System;
using Google.Apis.Docs.v1.Data;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocsClient
{
    public Document GetDocumentById(string id)
    {
        throw new NotImplementedException();
    }
}