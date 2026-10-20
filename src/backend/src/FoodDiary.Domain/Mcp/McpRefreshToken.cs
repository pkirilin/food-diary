namespace FoodDiary.Domain.Mcp;

public class McpRefreshToken
{
    public required Guid Id { get; init; }
    public required Guid FamilyId { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
    public DateTimeOffset? UsedAt { get; init; }
    public DateTimeOffset? RevokedAt { get; init; }
}
