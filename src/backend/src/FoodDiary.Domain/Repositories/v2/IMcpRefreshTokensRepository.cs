using FoodDiary.Domain.Mcp;

namespace FoodDiary.Domain.Repositories.v2;

public interface IMcpRefreshTokensRepository
{
    Task DeleteExpired(DateTimeOffset now, CancellationToken cancellationToken);

    Task<bool> IsChainCancelled(Guid chainId, CancellationToken cancellationToken);

    Task<bool> TryAddRedeemed(RedeemedRefreshToken token, CancellationToken cancellationToken);

    Task AddCancelledChain(CancelledRefreshTokenChain chain, CancellationToken cancellationToken);
}
