using FoodDiary.Domain.Mcp;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Mcp.IssueRefreshToken;

public record IssueRefreshTokenCommand(Guid Id, Guid FamilyId, DateTimeOffset ExpiresAt);

public class IssueRefreshTokenCommandHandler(IMcpRefreshTokensRepository refreshTokens)
{
    public Task Handle(IssueRefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var token = new McpRefreshToken
        {
            Id = command.Id,
            FamilyId = command.FamilyId,
            ExpiresAt = command.ExpiresAt
        };

        return refreshTokens.Add(token, cancellationToken);
    }
}
