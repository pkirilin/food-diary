using FoodDiary.Infrastructure;

namespace FoodDiary.IntegrationTests.Database;

public static class TestDatabaseUtils
{
    public static void Clear(FoodDiaryContext context)
    {
        context.Database.EnsureDeleted();
    }
}