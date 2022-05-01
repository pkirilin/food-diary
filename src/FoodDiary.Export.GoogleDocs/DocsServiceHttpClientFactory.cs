using Google.Apis.Http;

namespace FoodDiary.Export.GoogleDocs;

internal class DocsServiceHttpClientFactory : HttpClientFactory
{
    private HttpMessageHandler? _handler;
    
    public void WithHttpMessageHandler(HttpMessageHandler handler)
    {
        _handler = handler;
    }
    
    protected override HttpMessageHandler CreateHandler(CreateHttpClientArgs args)
    {
        return _handler ?? base.CreateHandler(args);
    }
}