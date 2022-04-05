using FoodDiary.IntegrationTests.Fakes;

namespace FoodDiary.IntegrationTests.Dsl.Builders;

public class GoogleOAuthClientHandlerBuilder
{
    private readonly FakeHttpMessageHandler _handler = new();

    public FakeHttpMessageHandler Please() => _handler;

    public GoogleOAuthClientHandlerBuilder ToValidateTokenSuccessfullyFor(string email)
    {
        _handler.WithSuccessStatusCode();
        _handler.WithJsonResponse(new { email });
        return this;
    }
    
    public GoogleOAuthClientHandlerBuilder ToValidateTokenWithError()
    {
        _handler.WithBadRequestStatusCode();
        return this;
    }
}