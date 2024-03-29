using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Migrator;

public class FoodDiaryContextFactory(ILoggerFactory loggerFactory) : IDesignTimeDbContextFactory<FoodDiaryContext>
{
    public FoodDiaryContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder()
            .UseNpgsql(GetConnectionString(args))
            .UseLoggerFactory(loggerFactory)
            .Options;

        return new FoodDiaryContext(options);
    }

    private static string? GetConnectionString(IReadOnlyList<string> args)
    {
        if (args.Count > 0 && !string.IsNullOrWhiteSpace(args[0]))
        {
            return args[0];
        }
        
        return MigratorConfiguration.ConnectionString;
    }
}