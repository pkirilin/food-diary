using System.Diagnostics.CodeAnalysis;
using System.Reflection;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.WeightTracking;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class FoodDiaryContext(DbContextOptions options) : DbContext(options), IUnitOfWork, IDataProtectionKeyContext
{
    public DbSet<DataProtectionKey> DataProtectionKeys { get; init; }
    public DbSet<Note> Notes { get; init; }
    public DbSet<Product> Products { get; init; }
    public DbSet<Category> Categories { get; init; }
    public DbSet<WeightLog> WeightLogs { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}