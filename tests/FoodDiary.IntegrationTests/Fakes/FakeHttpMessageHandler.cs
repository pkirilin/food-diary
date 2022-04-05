using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeHttpMessageHandler : HttpMessageHandler
{
    public FakeHttpMessageHandler WithGetMethod()
    {
        return this;
    }
    
    public FakeHttpMessageHandler WithPath(string path)
    {
        return this;
    }
    
    public FakeHttpMessageHandler WithQueryParameter(string name, string value)
    {
        return this;
    }
    
    public FakeHttpMessageHandler WithSuccessStatusCode()
    {
        return this;
    }
    
    public FakeHttpMessageHandler WithBadRequestStatusCode()
    {
        return this;
    }

    public FakeHttpMessageHandler WithJsonResponse(object responseObject)
    {
        return this;
    }
    
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}