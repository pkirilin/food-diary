using FoodDiary.Domain.Mcp;
using FoodDiary.Domain.Repositories.v2;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories.v2;

public class McpRefreshTokensRepository(FoodDiaryContext context) : IMcpRefreshTokensRepository
{
    public async Task DeleteExpired(DateTimeOffset now, CancellationToken cancellationToken)
    {
        await context.McpRedeemedRefreshTokens
            .Where(t => t.ExpiresAt <= now)
            .ExecuteDeleteAsync(cancellationToken);

        await context.McpCancelledRefreshTokenChains
            .Where(c => c.ExpiresAt <= now)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public Task<bool> IsChainCancelled(Guid chainId, CancellationToken cancellationToken)
    {
        return context.McpCancelledRefreshTokenChains.AnyAsync(c => c.ChainId == chainId, cancellationToken);
    }

    public async Task<bool> TryAddRedeemed(RedeemedRefreshToken token, CancellationToken cancellationToken)
    {
        var insertedRows = await context.Database.ExecuteSqlAsync(
            $"""
             INSERT INTO "McpRedeemedRefreshTokens" ("TokenId", "ExpiresAt")
             VALUES ({token.TokenId}, {token.ExpiresAt})
             ON CONFLICT ("TokenId") DO NOTHING
             """,
            cancellationToken);

        return insertedRows == 1;
    }

    public Task AddCancelledChain(CancelledRefreshTokenChain chain, CancellationToken cancellationToken)
    {
        return context.Database.ExecuteSqlAsync(
            $"""
             INSERT INTO "McpCancelledRefreshTokenChains" ("ChainId", "ExpiresAt")
             VALUES ({chain.ChainId}, {chain.ExpiresAt})
             ON CONFLICT ("ChainId") DO NOTHING
             """,
            cancellationToken);
    }
}
