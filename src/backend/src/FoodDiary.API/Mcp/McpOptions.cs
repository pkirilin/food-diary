namespace FoodDiary.API.Mcp;

public class McpOptions
{
    public const string SectionName = "Mcp";

    public required bool Enabled { get; init; }

    public string? BaseUrl { get; init; }

    public IReadOnlyList<McpClientRegistration> Clients { get; init; } = [];

    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromHours(1);

    public TimeSpan RefreshTokenLifetime { get; init; } = TimeSpan.FromDays(30);

    public string McpResource => $"{BaseUrl}/mcp";

    public string ResourceMetadataUrl => $"{BaseUrl}/.well-known/oauth-protected-resource/mcp";

    public McpClientRegistration? FindClient(string? clientId) =>
        Clients.FirstOrDefault(client => client.ClientId == clientId);
}
