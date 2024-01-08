using FoodDiary.Application.Abstractions;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public class FakeDateTimeProvider : IDateTimeProvider
{
    public const string CurrentFakeDateAsString = "2024-01-01";

    public DateTime Now => DateTime.Parse(CurrentFakeDateAsString);
}