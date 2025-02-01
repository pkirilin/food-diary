using System.Globalization;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public class FakeDateTimeProvider : TimeProvider
{
    private const string CurrentFakeDateAsString = "2024-01-01";
    
    public static DateOnly Today() => DateOnly.Parse(CurrentFakeDateAsString);
    public static DateOnly Yesterday() => Today().AddDays(-1);

    public override DateTimeOffset GetUtcNow() =>
        DateTime.SpecifyKind(
            DateTime.Parse(CurrentFakeDateAsString, CultureInfo.InvariantCulture),
            DateTimeKind.Utc);
}