using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public static class FakeDateAndTimeExtensions
{
    public static void AddFakeDateAndTime(this IServiceCollection services)
    {
        services.AddSingleton<TimeProvider, FakeDateTimeProvider>();
    }
}