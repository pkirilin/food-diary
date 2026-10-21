using JetBrains.Annotations;

namespace FoodDiary.Contracts.Mcp;

[PublicAPI]
public class GetMcpConsentResponse
{
    public required string ClientName { get; init; }

    public required string? LogoUri { get; init; }

    public required string ClientIdHost { get; init; }

    public required string RedirectUriHost { get; init; }

    public required bool IsLocalhostOnly { get; init; }
}
