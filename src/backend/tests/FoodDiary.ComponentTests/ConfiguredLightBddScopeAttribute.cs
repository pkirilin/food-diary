using FoodDiary.ComponentTests.Formatting;
using FoodDiary.Domain.Entities;
using FoodDiary.Infrastructure.Utils;
using LightBDD.Core.Configuration;

namespace FoodDiary.ComponentTests;

internal class ConfiguredLightBddScopeAttribute : LightBddScopeAttribute
{
    protected override void OnConfigure(LightBddConfiguration configuration)
    {
        configuration
            .ValueFormattingConfiguration()
            .RegisterExplicit(typeof(Page), new PageFormatter())
            .RegisterExplicit(typeof(Note), new NoteFormatter(new CaloriesCalculator()))
            .RegisterExplicit(typeof(Product), new ProductFormatter())
            .RegisterExplicit(typeof(Category), new CategoryFormatter());
    }
}