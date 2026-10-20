using FoodDiary.Domain.Mcp;

namespace FoodDiary.Domain.Repositories.v2;

public interface IMcpRefreshTokensRepository
{
    Task DeleteExpiredFamilies(DateTimeOffset now, CancellationToken cancellationToken);

    Task Add(McpRefreshToken token, CancellationToken cancellationToken);

    Task<bool> TryRotate(
        Guid usedTokenId,
        McpRefreshToken newToken,
        DateTimeOffset now,
        CancellationToken cancellationToken);

    Task RevokeFamily(Guid familyId, DateTimeOffset now, CancellationToken cancellationToken);
}
