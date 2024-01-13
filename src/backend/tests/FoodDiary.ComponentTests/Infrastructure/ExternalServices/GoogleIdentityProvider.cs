using System.Net;
using MbDotNet;
using MbDotNet.Models;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class GoogleIdentityProvider
{
    public const int Port = 4545;
    
    private readonly IClient _mountebankClient;

    public GoogleIdentityProvider(IClient mountebankClient)
    {
        _mountebankClient = mountebankClient;
    }

    public Task SetupAccessTokenSuccessfullyRefreshed()
    {
        return _mountebankClient.CreateHttpImposterAsync(Port, imposter => imposter
            .AddStub()
            .OnPathAndMethodEqual("/token", Method.Post)
            .ReturnsJson(HttpStatusCode.OK, new
            {
                access_token = "new_fake_access_token",
                expires_in = 3599,
                refresh_token = "new_fake_refresh_token",
                scope = "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
                token_type = "Bearer",
                id_token = "new_fake_id_token"
            }));
    }
}