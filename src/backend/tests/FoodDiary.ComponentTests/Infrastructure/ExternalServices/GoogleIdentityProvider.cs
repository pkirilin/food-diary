using System.Net;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class GoogleIdentityProvider
{
    private readonly IClient _mountebankClient;

    public GoogleIdentityProvider(IClient mountebankClient)
    {
        _mountebankClient = mountebankClient;
    }
    
    public const int Port = 4545;

    public Task Start()
    {
        var imposter = new HttpImposter(Port, nameof(GoogleIdentityProvider), new HttpImposterOptions());
        return _mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupAccessTokenSuccessfullyRefreshed()
    {
        return _mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
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

    public Task SetupUserInfoSuccessfullyReceived()
    {
        return _mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual("/userinfo", Method.Get)
            .ReturnsJson(HttpStatusCode.OK, new {}));
    }
}