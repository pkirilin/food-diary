using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.EntityConfigurations;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure
{
    public class FoodDiaryContext : DbContext
    {
        public FoodDiaryContext([NotNull] DbContextOptions options) : base(options)
        {
        }

        public DbSet<Page> Pages { get; set; }

        public DbSet<Page> Notes { get; set; }

        public DbSet<Page> Products { get; set; }

        public DbSet<Page> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new PageConfiguration());
            modelBuilder.ApplyConfiguration(new NoteConfiguration());
            modelBuilder.ApplyConfiguration(new ProductConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        }
    }
}
