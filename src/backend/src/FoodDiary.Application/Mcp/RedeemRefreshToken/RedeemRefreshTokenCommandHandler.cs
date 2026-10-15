using FoodDiary.Domain.Mcp;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Mcp.RedeemRefreshToken;

public record RedeemRefreshTokenCommand(
    Guid TokenId,
    Guid ChainId,
    DateTimeOffset ExpiresAt,
    TimeSpan RefreshTokenLifetime);

public abstract record RedeemRefreshTokenResult
{
    public record Redeemed : RedeemRefreshTokenResult;

    public record AlreadyRedeemed : RedeemRefreshTokenResult;

    public record ChainCancelled : RedeemRefreshTokenResult;
}

public class RedeemRefreshTokenCommandHandler(IMcpRefreshTokensRepository refreshTokens, TimeProvider timeProvider)
{
    public async Task<RedeemRefreshTokenResult> Handle(
        RedeemRefreshTokenCommand command,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();

        await refreshTokens.DeleteExpired(now, cancellationToken);

        if (await refreshTokens.IsChainCancelled(command.ChainId, cancellationToken))
        {
            return new RedeemRefreshTokenResult.ChainCancelled();
        }

        var token = new RedeemedRefreshToken { TokenId = command.TokenId, ExpiresAt = command.ExpiresAt };

        if (await refreshTokens.TryAddRedeemed(token, cancellationToken))
        {
            return new RedeemRefreshTokenResult.Redeemed();
        }

        // Every token in the chain was issued before now, so none of them outlives this record
        var cancelledChain = new CancelledRefreshTokenChain
        {
            ChainId = command.ChainId,
            ExpiresAt = now + command.RefreshTokenLifetime
        };

        await refreshTokens.AddCancelledChain(cancelledChain, cancellationToken);

        return new RedeemRefreshTokenResult.AlreadyRedeemed();
    }
}
