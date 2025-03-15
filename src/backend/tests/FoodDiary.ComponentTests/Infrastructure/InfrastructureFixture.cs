using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Infrastructure;

// TODO: remove
[UsedImplicitly]
public class InfrastructureFixture(DatabaseFixture database)
{
    public DatabaseFixture Database => database;
}