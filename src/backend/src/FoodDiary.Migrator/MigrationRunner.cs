using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Serilog;

namespace FoodDiary.Migrator;

public class MigrationRunner
{
    public static async Task<int> RunMigrations(string[] args)
    {
        var serviceProvider = BuildServiceProvider();
        var loggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();
        var logger = loggerFactory.CreateLogger<MigrationRunner>();
    
        try
        {
            var factory = new FoodDiaryContextFactory(loggerFactory);
            var context = factory.CreateDbContext(args);
            await context.Database.MigrateAsync();
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error while applying migrations");
            return -1;
        }
        
        return 0;
    }
    
    private static ServiceProvider BuildServiceProvider()
    {
        var services = new ServiceCollection();
        
        services.AddSerilog(logger => logger
            .ReadFrom.Configuration(MigratorConfiguration.Configuration));

        return services.BuildServiceProvider();
    }
}