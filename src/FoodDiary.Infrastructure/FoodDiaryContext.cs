using System;
using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.EntityConfigurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FoodDiary.Infrastructure
{
    [SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
    public class FoodDiaryContext : DbContext, IUnitOfWork
    {
        private readonly IConfiguration _configuration;

        public FoodDiaryContext(DbContextOptions options) : base(options)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }
        
        public FoodDiaryContext(DbContextOptions options, IConfiguration configuration) : base(options)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            _configuration = configuration;
        }

        public DbSet<Page> Pages { get; set; }

        public DbSet<Note> Notes { get; set; }

        public DbSet<Product> Products { get; set; }

        public DbSet<Category> Categories { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // optionsBuilder.UseNpgsql(_configuration.GetConnectionString("FoodDiaryContext"));
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
