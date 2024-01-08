using System;
using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.EntityConfigurations;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class FoodDiaryContext : DbContext, IUnitOfWork, IDataProtectionKeyContext
{
    public FoodDiaryContext(DbContextOptions options) : base(options)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }
        
    public DbSet<DataProtectionKey> DataProtectionKeys { get; set; }

    public DbSet<Page> Pages { get; set; }

    public DbSet<Note> Notes { get; set; }

    public DbSet<Product> Products { get; set; }

    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new PageConfiguration());
        modelBuilder.ApplyConfiguration(new NoteConfiguration());
        modelBuilder.ApplyConfiguration(new ProductConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
    }
}