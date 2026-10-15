namespace FoodDiary.Domain.Mcp;

public class RedeemedRefreshToken
{
    public required Guid TokenId { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}
