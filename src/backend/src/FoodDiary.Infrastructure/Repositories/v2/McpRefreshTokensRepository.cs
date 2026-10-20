using FoodDiary.Domain.Mcp;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

public class McpRefreshTokensRepository(FoodDiaryContext context) : IMcpRefreshTokensRepository
{
    public Task DeleteExpiredFamilies(DateTimeOffset now, CancellationToken cancellationToken)
    {
        return context.McpRefreshTokens
            .Where(t => t.ExpiresAt <= now &&
                        !context.McpRefreshTokens.Any(f => f.FamilyId == t.FamilyId && f.ExpiresAt > now))
            .ExecuteDeleteAsync(cancellationToken);
    }

    public Task Add(McpRefreshToken token, CancellationToken cancellationToken)
    {
        context.McpRefreshTokens.Add(token);
        return context.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> TryRotate(
        Guid usedTokenId,
        McpRefreshToken newToken,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        await using var transaction = await context.Database.BeginTransactionAsync(cancellationToken);

        var usedRows = await context.McpRefreshTokens
            .Where(t => t.Id == usedTokenId &&
                        t.UsedAt == null &&
                        !context.McpRefreshTokens.Any(f => f.FamilyId == t.FamilyId && f.RevokedAt != null))
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.UsedAt, now), cancellationToken);

        if (usedRows == 0)
        {
            return false;
        }

        context.McpRefreshTokens.Add(newToken);
        await context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return true;
    }

    public Task RevokeFamily(Guid familyId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        return context.McpRefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.RevokedAt, now), cancellationToken);
    }
}
