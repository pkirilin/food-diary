using System.Diagnostics.CodeAnalysis;
using System.Net;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class OpenAIApi(IClient mountebankClient)
{
    public const int Port = 4646;

    public Task Start()
    {
        var imposter = new HttpImposter(Port, nameof(OpenAIApi), new HttpImposterOptions());
        return mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupCompletionSuccess(string content)
    {
        return mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual("/v1/chat/completions", Method.Post)
            .ReturnsJson(HttpStatusCode.OK, new
            {
                choices = new[]
                {
                    new
                    {
                        message = new
                        {
                            role = "assistant",
                            content
                        }
                    }
                }
            }));
    }

    public Task SetupCompletionFailure(HttpStatusCode statusCode)
    {
        return mountebankClient.AddHttpImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual("/v1/chat/completions", Method.Post)
            .ReturnsStatus(statusCode)
        );
    }
}