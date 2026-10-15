using System.Net;
using System.Text.Json;
using MbDotNet;
using MbDotNet.Models;
using MbDotNet.Models.Imposters;
using MbDotNet.Models.Stubs;

namespace FoodDiary.ComponentTests.Infrastructure.ExternalServices;

public class McpClientMetadataHost(IClient mountebankClient)
{
    public const int Port = 4747;

    public static string UrlOf(string path) => $"https://localhost:{Port}{path}";

    public Task Start()
    {
        var imposter = new HttpsImposter(Port, nameof(McpClientMetadataHost), new HttpsImposterOptions());
        return mountebankClient.OverwriteAllImposters([imposter]);
    }

    public Task SetupDocument(string path, object document, int? latencyInMilliseconds = null)
    {
        return SetupBody(path, JsonSerializer.Serialize(document), latencyInMilliseconds);
    }

    public Task SetupBody(string path, string body, int? latencyInMilliseconds = null)
    {
        return mountebankClient.AddHttpsImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual(path, Method.Get)
            .Returns(
                HttpStatusCode.OK,
                new Dictionary<string, object> { ["Content-Type"] = "application/json" },
                body,
                latencyInMilliseconds: latencyInMilliseconds));
    }

    public Task SetupStatus(string path, HttpStatusCode statusCode, IDictionary<string, object>? headers = null)
    {
        return mountebankClient.AddHttpsImposterStubAsync(Port, new HttpStub()
            .OnPathAndMethodEqual(path, Method.Get)
            .Returns(statusCode, headers ?? new Dictionary<string, object>(), string.Empty));
    }
}
