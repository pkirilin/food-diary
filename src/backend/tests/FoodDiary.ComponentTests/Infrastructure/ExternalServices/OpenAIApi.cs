using System.Diagnostics.CodeAnalysis;
using System.Net;
using System.Text.Json;
using FoodDiary.Application.Notes.Recognize;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class OpenAIApi(IClient mountebankClient)
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    
    public const int Port = 4646;

    public Task Start()
    {
        var imposter = new HttpImposter(Port, nameof(OpenAIApi), new HttpImposterOptions());
        return mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupNotesRecognized(IReadOnlyList<RecognizeNoteItem> notes)
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
                            content = JsonSerializer.Serialize(notes, SerializerOptions)
                        }
                    }
                }
            }));
    }
}