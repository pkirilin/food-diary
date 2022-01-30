using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;

try
{
    var serviceProvider = BuildServiceProvider();
    Migrate(serviceProvider);
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

    return services.BuildServiceProvider();
}

void Migrate(IServiceProvider serviceProvider)
{
    using var serviceScope = serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope();
    using var context = serviceScope.ServiceProvider.GetRequiredService<FoodDiaryContext>();
    var migrator = context.GetInfrastructure().GetRequiredService<IMigrator>();
    migrator.Migrate();
}