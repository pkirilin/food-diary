using FoodDiary.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.DataAccess;

public static class DataAccessExtensions
{
    public static void AddTestDb(this IServiceCollection services, DatabaseFixture database)
    {
        var dbContextOptionsDescriptor = services
            .FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<FoodDiaryContext>));

        if (dbContextOptionsDescriptor is not null)
        {
            services.Remove(dbContextOptionsDescriptor);

            services.AddDbContext<FoodDiaryContext>(options =>
            {
                options.UseNpgsql(database.ConnectionString);
            });
        }
    }
}