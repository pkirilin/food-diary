using FoodDiary.Domain.Mcp;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDiary.Infrastructure.EntityConfigurations;

[UsedImplicitly]
public class McpRefreshTokenConfiguration : IEntityTypeConfiguration<McpRefreshToken>
{
    public void Configure(EntityTypeBuilder<McpRefreshToken> builder)
    {
        builder.ToTable("McpRefreshTokens");
        builder.HasKey(t => t.Id);
        builder.HasIndex(t => t.FamilyId);
        builder.HasIndex(t => t.ExpiresAt);
    }
}
