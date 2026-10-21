using FoodDiary.Domain.Mcp;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Mcp.RotateRefreshToken;

public record RotateRefreshTokenCommand(Guid Id, Guid FamilyId, Guid NewTokenId, DateTimeOffset NewTokenExpiresAt);

public class RotateRefreshTokenCommandHandler(IMcpRefreshTokensRepository refreshTokens, TimeProvider timeProvider)
{
    public async Task<bool> Handle(RotateRefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();

        await refreshTokens.DeleteExpiredFamilies(now, cancellationToken);

        var newToken = new McpRefreshToken
        {
            Id = command.NewTokenId,
            FamilyId = command.FamilyId,
            ExpiresAt = command.NewTokenExpiresAt
        };

        if (await refreshTokens.TryRotate(command.Id, newToken, now, cancellationToken))
        {
            return true;
        }

        // A client that disconnects right after presenting a used token must not escape revocation
        await refreshTokens.RevokeFamily(command.FamilyId, now, CancellationToken.None);

        return false;
    }
}
