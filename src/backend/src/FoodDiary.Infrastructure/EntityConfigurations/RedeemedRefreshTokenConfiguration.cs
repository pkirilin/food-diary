using FoodDiary.Domain.Mcp;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDiary.Infrastructure.EntityConfigurations;

[UsedImplicitly]
public class RedeemedRefreshTokenConfiguration : IEntityTypeConfiguration<RedeemedRefreshToken>
{
    public void Configure(EntityTypeBuilder<RedeemedRefreshToken> builder)
    {
        builder.ToTable("McpRedeemedRefreshTokens");

        builder.HasKey(t => t.TokenId);
    }
}
