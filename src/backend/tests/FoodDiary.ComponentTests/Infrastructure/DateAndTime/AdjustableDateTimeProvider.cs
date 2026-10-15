namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public class AdjustableDateTimeProvider : TimeProvider
{
    private DateTimeOffset _utcNow = new FakeDateTimeProvider().GetUtcNow();

    public void Advance(TimeSpan by) => _utcNow += by;

    public override DateTimeOffset GetUtcNow() => _utcNow;
}
