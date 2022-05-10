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

    public void WithSuccessStatusCode()
    {
        _statusCode = HttpStatusCode.OK;
    }
    
    public void WithBadRequestStatusCode()
    {
        _statusCode = HttpStatusCode.BadRequest;
    }

    public void WithJsonResponse<T>(T responseObject)
    {
        var json = JsonSerializer.Serialize(responseObject);
        _responseContent = new StringContent(json);
    }
    
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var response = new HttpResponseMessage(_statusCode);
        
        response.Content = _responseContent;

        return Task.FromResult(response);
    }
}