using FoodDiary.Application.Abstractions;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Infrastructure.DateAndTime;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static void AddInfrastructure(this IServiceCollection services)
    {
        services.AddDbContext<FoodDiaryContext>((serviceProvider, builder) =>
        {
            var configuration = serviceProvider.GetRequiredService<IConfiguration>();
            var connectionString = configuration.GetConnectionString("Default");
            builder.UseNpgsql(connectionString);
        });

        services.AddDataProtection()
            .PersistKeysToDbContext<FoodDiaryContext>();

        services.AddScoped<IFoodDiaryUnitOfWork, FoodDiaryUnitOfWork>();
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();
    }
}