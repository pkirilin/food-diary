using System.Globalization;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public class FakeDateTimeProvider : TimeProvider
{
    public const string CurrentFakeDateAsString = "2024-01-01";

    public override DateTimeOffset GetUtcNow() =>
        DateTime.SpecifyKind(
            DateTime.Parse(CurrentFakeDateAsString, CultureInfo.InvariantCulture),
            DateTimeKind.Utc);
}