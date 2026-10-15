using System.Net;
using System.Net.Sockets;
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

    private const int MaxDocumentBytes = 5 * 1024;

    private static readonly CimdMetadataDocumentFetch.Failed NotJsonObject =
        new("client ID metadata document is not a JSON object");

    public static void AddHttpClient(IServiceCollection services)
    {
        services.AddHttpClient(HttpClientName, client =>
            {
                client.Timeout = TimeSpan.FromSeconds(5);
                client.MaxResponseContentBufferSize = MaxDocumentBytes;
            })
            .UseSocketsHttpHandler((handler, serviceProvider) =>
            {
                var addressFilter = serviceProvider.GetRequiredService<ICimdAddressFilter>();

                // A proxy would make ConnectCallback dial the proxy, leaving the target address unchecked
                handler.UseProxy = false;
                handler.AllowAutoRedirect = false;
                handler.UseCookies = false;
                handler.ConnectCallback = (context, cancellationToken) =>
                    ConnectToAllowedAddress(context.DnsEndPoint, addressFilter, cancellationToken);
            });
    }

    public async Task<CimdMetadataDocumentFetch> Fetch(string clientId, CancellationToken cancellationToken)
    {
        try
        {
            using var response = await httpClientFactory.CreateClient(HttpClientName).GetAsync(clientId, cancellationToken);

            if ((int)response.StatusCode is >= 300 and < 400)
            {
                return new CimdMetadataDocumentFetch.Failed(
                    "client ID metadata document responded with a redirect, which is not followed");
            }

            if (response.StatusCode != HttpStatusCode.OK)
            {
                return new CimdMetadataDocumentFetch.Failed("client ID metadata document did not respond with 200 OK");
            }

            var document = JsonSerializer.Deserialize<JsonElement>(await response.Content.ReadAsStringAsync(cancellationToken));

            return document.ValueKind == JsonValueKind.Object
                ? new CimdMetadataDocumentFetch.Fetched(document)
                : NotJsonObject;
        }
        catch (JsonException)
        {
            return NotJsonObject;
        }
        catch (HttpRequestException exception) when (exception.InnerException is NoAllowedAddressException)
        {
            return new CimdMetadataDocumentFetch.Failed(
                "client ID metadata document URL does not resolve to a public address");
        }
        catch (HttpRequestException exception)
            when (exception.HttpRequestError == HttpRequestError.ConfigurationLimitExceeded)
        {
            return new CimdMetadataDocumentFetch.Failed("client ID metadata document is larger than 5 KB");
        }
        catch (HttpRequestException)
        {
            return new CimdMetadataDocumentFetch.Failed("client ID metadata document could not be fetched");
        }
        catch (TaskCanceledException exception) when (exception.InnerException is TimeoutException)
        {
            return new CimdMetadataDocumentFetch.Failed("client ID metadata document did not respond within 5 seconds");
        }
    }

    // Checking the addresses the socket connects to, rather than a separate DNS lookup, defeats DNS rebinding
    private static async ValueTask<Stream> ConnectToAllowedAddress(
        DnsEndPoint endPoint,
        ICimdAddressFilter addressFilter,
        CancellationToken cancellationToken)
    {
        var resolvedAddresses = await Dns.GetHostAddressesAsync(endPoint.Host.Trim('[', ']'), cancellationToken);
        var allowedAddresses = resolvedAddresses.Where(addressFilter.IsAllowed).ToArray();

        if (allowedAddresses.Length == 0)
        {
            throw new NoAllowedAddressException();
        }

        var socket = new Socket(SocketType.Stream, ProtocolType.Tcp) { NoDelay = true };

        try
        {
            await socket.ConnectAsync(allowedAddresses, endPoint.Port, cancellationToken);
            return new NetworkStream(socket, ownsSocket: true);
        }
        catch
        {
            socket.Dispose();
            throw;
        }
    }

    private sealed class NoAllowedAddressException() : Exception("The host resolves only to special-use addresses");
}
