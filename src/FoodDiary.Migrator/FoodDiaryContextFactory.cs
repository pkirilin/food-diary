using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Migrator;

public class FoodDiaryContextFactory : IDesignTimeDbContextFactory<FoodDiaryContext>
{
    private readonly ILoggerFactory _loggerFactory;

    public FoodDiaryContextFactory(ILoggerFactory loggerFactory)
    {
        _loggerFactory = loggerFactory;
    }
    
    public FoodDiaryContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder()
            .UseNpgsql(MigratorConfiguration.ConnectionString)
            .UseLoggerFactory(_loggerFactory)
            .Options;

        return new FoodDiaryContext(options);
    }
}