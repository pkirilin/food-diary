using System.Net;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class GoogleIdentityProvider(IClient mountebankClient)
{
    public const int Port = 4545;

    public Task Start()
    {
        var imposter = new HttpImposter(Port, nameof(GoogleIdentityProvider), new HttpImposterOptions());
        return mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupAccessTokenSuccessfullyRefreshed()
    {
        return mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual("/token", Method.Post)
            .ReturnsJson(HttpStatusCode.OK, new
            {
                access_token = "new_fake_access_token",
                expires_in = 3599,
                scope = $"{Constants.AuthenticationScopes.Openid} " +
                        $"{Constants.AuthenticationScopes.GoogleProfile} " +
                        $"{Constants.AuthenticationScopes.GoogleEmail} " +
                        $"{Constants.AuthenticationScopes.GoogleDocs} " +
                        $"{Constants.AuthenticationScopes.GoogleDrive}",
                token_type = "Bearer",
                id_token = "new_fake_id_token"
            }));
    }

    public Task SetupUserInfoSuccessfullyReceived()
    {
        return mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual("/userinfo", Method.Get)
            .ReturnsJson(HttpStatusCode.OK, new {}));
    }
}