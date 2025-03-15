using FoodDiary.ComponentTests.Formatting;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.WeightTracking;
using FoodDiary.Infrastructure.Utils;
using LightBDD.Core.Configuration;

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
    }
}