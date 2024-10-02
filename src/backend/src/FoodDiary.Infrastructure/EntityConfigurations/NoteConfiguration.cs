using FoodDiary.Domain.Entities;
using JetBrains.Annotations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDiary.Infrastructure.EntityConfigurations;

[UsedImplicitly]
public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.ToTable("Notes");
        builder.HasKey(n => n.Id);
        builder.HasIndex(n => n.Date);

        builder.Property(n => n.Date)
            .HasDefaultValueSql("CURRENT_DATE");

        builder.HasOne(n => n.Product)
            .WithMany(p => p.Notes)
            .HasForeignKey(n => n.ProductId);
    }
}