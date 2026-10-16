using JetBrains.Annotations;

namespace FoodDiary.Contracts.Mcp;

[PublicAPI]
public class SubmitMcpConsentRequest
{
    public required string ConsentRequest { get; init; }

    public required bool Approved { get; init; }
}
