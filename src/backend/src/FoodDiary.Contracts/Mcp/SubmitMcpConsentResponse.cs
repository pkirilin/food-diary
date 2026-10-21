using JetBrains.Annotations;

namespace FoodDiary.Contracts.Mcp;

[PublicAPI]
public class SubmitMcpConsentResponse
{
    public required string RedirectUrl { get; init; }
}
