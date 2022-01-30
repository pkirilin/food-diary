using FoodDiary.Migrator;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

try
{
    var serviceProvider = BuildServiceProvider();
    var logger = serviceProvider.GetRequiredService<ILoggerFactory>();
    Migrate(logger);
    return 0;
}
catch (Exception e)
{
    Console.WriteLine(e);
    return -1;
}

IServiceProvider BuildServiceProvider()
{
    var services = new ServiceCollection();
    
    services.AddLogging(logging => logging.AddConsole());

    return services.BuildServiceProvider();
}

void Migrate(ILoggerFactory loggerFactory)
{
    var logger = loggerFactory.CreateLogger<Program>();
    
    try
    {
        var factory = new FoodDiaryContextFactory(loggerFactory);
        var context = factory.CreateDbContext(Array.Empty<string>());
        context.Database.Migrate();
    }
    catch (Exception e)
    {
        logger.LogError(e, "Error while applying migrations");
    }
}