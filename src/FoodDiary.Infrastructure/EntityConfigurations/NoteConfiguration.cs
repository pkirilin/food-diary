using FoodDiary.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FoodDiary.Infrastructure.EntityConfigurations
{
    public class NoteConfiguration : IEntityTypeConfiguration<Note>
    {
        public void Configure(EntityTypeBuilder<Note> builder)
        {
            builder.ToTable("Notes");

            builder.HasKey(n => n.Id);

            builder.HasOne(n => n.Product)
                .WithMany(p => p.Notes)
                .HasForeignKey(n => n.ProductId);

            builder.HasOne(n => n.Page)
                .WithMany(p => p.Notes)
                .HasForeignKey(n => n.PageId);
        }
    }
}
