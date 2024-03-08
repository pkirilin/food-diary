using FoodDiary.Application.Auth.GetStatus;
using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Infrastructure.Integrations.Google;
using FoodDiary.Infrastructure.Repositories.v2;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static void AddInfrastructure(this IServiceCollection services)
    {
        services.AddDataAccess();
        services.AddIntegrations();
    }

    private static void AddDataAccess(this IServiceCollection services)
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
        services.AddScoped<IPagesRepository, PagesRepository>();
    }

    private static void AddIntegrations(this IServiceCollection services)
    {
        services.AddHttpClient<IOAuthClient, GoogleOAuthClient>();
    }
}