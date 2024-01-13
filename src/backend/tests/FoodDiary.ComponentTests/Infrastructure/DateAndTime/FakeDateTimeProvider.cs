using System.Globalization;
using FoodDiary.Application.Abstractions;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public class FakeDateTimeProvider : TimeProvider, IDateTimeProvider
{
    public const string CurrentFakeDateAsString = "2024-01-01";

    public DateTime Now => DateTime.SpecifyKind(
        DateTime.Parse(CurrentFakeDateAsString, CultureInfo.InvariantCulture),
        DateTimeKind.Utc);

    public override DateTimeOffset GetUtcNow() => Now;
}