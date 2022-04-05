using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeHttpMessageHandler : HttpMessageHandler
{
    private HttpStatusCode _statusCode = HttpStatusCode.OK;
    private HttpContent _responseContent;

    public FakeHttpMessageHandler WithSuccessStatusCode()
    {
        _statusCode = HttpStatusCode.OK;
        return this;
    }
    
    public FakeHttpMessageHandler WithBadRequestStatusCode()
    {
        _statusCode = HttpStatusCode.BadRequest;
        return this;
    }

    public FakeHttpMessageHandler WithJsonResponse(object responseObject)
    {
        var json = JsonSerializer.Serialize(responseObject);
        _responseContent = new StringContent(json);
        return this;
    }
    
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = new HttpResponseMessage(_statusCode);
        
        response.Content = _responseContent;

        return Task.FromResult(response);
    }
}