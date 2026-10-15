using FoodDiary.Domain.Mcp;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDiary.Infrastructure.EntityConfigurations;

[UsedImplicitly]
public class CancelledRefreshTokenChainConfiguration : IEntityTypeConfiguration<CancelledRefreshTokenChain>
{
    public void Configure(EntityTypeBuilder<CancelledRefreshTokenChain> builder)
    {
        builder.ToTable("McpCancelledRefreshTokenChains");

        builder.HasKey(c => c.ChainId);
    }
}
