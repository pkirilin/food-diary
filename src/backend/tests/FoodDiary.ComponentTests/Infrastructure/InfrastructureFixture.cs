using FoodDiary.ComponentTests.Infrastructure.DataAccess;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using JetBrains.Annotations;

namespace FoodDiary.ComponentTests.Infrastructure;

// TODO: remove
[UsedImplicitly]
public class InfrastructureFixture(DatabaseFixture database, ExternalServicesFixture externalServices)
{
    public DatabaseFixture Database => database;
    public ExternalServicesFixture ExternalServices => externalServices;
}