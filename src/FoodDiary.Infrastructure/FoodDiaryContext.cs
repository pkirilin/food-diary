using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.EntityConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Infrastructure
{
    public class FoodDiaryContext : DbContext
    {
        private readonly IConfiguration _configuration;

        public FoodDiaryContext(DbContextOptions options, IConfiguration configuration, ILoggerFactory lf) : base(options)
        {
            _configuration = configuration;
        }

        public DbSet<Page> Pages { get; set; }

        public DbSet<Note> Notes { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<Category> Categories { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseNpgsql(_configuration.GetConnectionString("FoodDiaryContext"));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new PageConfiguration());
            modelBuilder.ApplyConfiguration(new NoteConfiguration());
            modelBuilder.ApplyConfiguration(new ProductConfiguration());
            modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        }
    }
}
