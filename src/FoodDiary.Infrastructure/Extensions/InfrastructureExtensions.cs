using FoodDiary.Domain.Abstractions.v2;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace FoodDiary.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static void AddInfrastructure(this IServiceCollection services, IHostEnvironment env)
    {
        if (!env.IsEnvironment("Test"))
        {
            services.AddDbContext<FoodDiaryContext>((serviceProvider, builder) =>
            {
                var configuration = serviceProvider.GetRequiredService<IConfiguration>();
                var connectionString = configuration.GetConnectionString("Default");
                builder.UseNpgsql(connectionString);
            });
        }

        services.AddScoped<IFoodDiaryUnitOfWork, FoodDiaryUnitOfWork>();
    }
}