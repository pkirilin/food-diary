namespace FoodDiary.Domain.Mcp;

public class CancelledRefreshTokenChain
{
    public required Guid ChainId { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}
