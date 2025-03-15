using System.Net;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;
using Polly;
using Polly.Retry;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class GoogleIdentityProvider(IClient mountebankClient)
{
    private static readonly ResiliencePipeline Pipeline = new ResiliencePipelineBuilder()
        .AddRetry(new RetryStrategyOptions
        {
            MaxRetryAttempts = 3
        })
        .Build();
    
    public const int Port = 4545;

    public async Task Start()
    {
        // Added retry to fix "System.Net.Http.HttpIOException: The response ended prematurely" error
        await Pipeline.ExecuteAsync(async cancellationToken =>
        {
            var imposter = new HttpImposter(Port, nameof(GoogleIdentityProvider), new HttpImposterOptions());
            await mountebankClient.OverwriteAllImposters([imposter], cancellationToken);
        });
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
                        $"{Constants.AuthenticationScopes.GoogleEmail} ",
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