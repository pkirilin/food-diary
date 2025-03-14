using FoodDiary.ComponentTests.Formatting;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.ComponentTests.Scenarios.Auth;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.WeightTracking;
using FoodDiary.Infrastructure.Utils;
using LightBDD.Core.Configuration;
using LightBDD.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests;

internal class ConfiguredLightBddScopeAttribute : LightBddScopeAttribute
{
    protected override void OnConfigure(LightBddConfiguration configuration)
    {
        configuration.ValueFormattingConfiguration()
            .RegisterExplicit(typeof(Note), new NoteFormatter(new CaloriesCalculator()))
            .RegisterExplicit(typeof(Product), new ProductFormatter())
            .RegisterExplicit(typeof(Category), new CategoryFormatter())
            .RegisterExplicit(typeof(WeightLog), new WeightLogFormatter());

        configuration.DependencyContainerConfiguration()
            .UseContainer(BuildServiceProvider(), _ => { });

        configuration.ExecutionExtensionsConfiguration()
            .RegisterGlobalSetUp<InfrastructureFixture>();
    }

    private static ServiceProvider BuildServiceProvider() => new ServiceCollection()
        .AddSingleton<FoodDiaryWebApplicationFactory>()
        .AddSingleton<InfrastructureFixture>()
        .AddSingleton<DatabaseFixture>()
        .AddSingleton<ExternalServicesFixture>()
        .AddScoped<AuthContext>()
        .BuildServiceProvider();
}