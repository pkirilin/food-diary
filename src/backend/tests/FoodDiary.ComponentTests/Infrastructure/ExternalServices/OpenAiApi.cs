using System.Net;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class OpenAiApi(IClient mountebankClient)
{
    public const int Port = 4646;

    public Task Start()
    {
        var imposter = new HttpImposter(Port, nameof(GoogleIdentityProvider), new HttpImposterOptions());
        return mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupNoteSuccessfullyRecognizedByPhoto()
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
                            content = "This is a fake response!"
                        }
                    }
                }
            }));
    }
}