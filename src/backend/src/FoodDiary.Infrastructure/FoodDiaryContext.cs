using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.EntityConfigurations;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class FoodDiaryContext(DbContextOptions options) : DbContext(options), IUnitOfWork, IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys { get; init; }
    public DbSet<Page> Pages { get; init; }
    public DbSet<Note> Notes { get; init; }
    public DbSet<Product> Products { get; init; }
    public DbSet<Category> Categories { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PageConfiguration());
        modelBuilder.ApplyConfiguration(new NoteConfiguration());
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
    }
}