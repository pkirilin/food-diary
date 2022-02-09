using FoodDiary.IntegrationTests.Dsl;

namespace FoodDiary.IntegrationTests.Extensions;

public static class WebApplicationFactoryExtensions
{
    public static SeedDatabaseBuilder PrepareDatabase(this FoodDiaryWebApplicationFactory webApplicationFactory)
    {
        return new SeedDatabaseBuilder(webApplicationFactory);
    }
}