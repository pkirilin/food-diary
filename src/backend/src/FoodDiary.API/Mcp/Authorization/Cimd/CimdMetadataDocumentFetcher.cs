using System.Text.Json;

namespace FoodDiary.API.Mcp.Authorization.Cimd;

public abstract record CimdMetadataDocumentFetch
{
    public sealed record Fetched(JsonElement Document) : CimdMetadataDocumentFetch;

    public sealed record Failed(string Reason) : CimdMetadataDocumentFetch;
}

public sealed class CimdMetadataDocumentFetcher(IHttpClientFactory httpClientFactory)
{
    public const string HttpClientName = "FoodDiary.Mcp.CimdMetadataDocument";

    public static void AddHttpClient(IServiceCollection services)
    {
        services.AddHttpClient(HttpClientName)
            .UseSocketsHttpHandler((_, _) => { });
    }

    public async Task<CimdMetadataDocumentFetch> Fetch(string clientId, CancellationToken cancellationToken)
    {
        using var response = await httpClientFactory.CreateClient(HttpClientName).GetAsync(clientId, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        return new CimdMetadataDocumentFetch.Fetched(JsonSerializer.Deserialize<JsonElement>(body));
    }
}
