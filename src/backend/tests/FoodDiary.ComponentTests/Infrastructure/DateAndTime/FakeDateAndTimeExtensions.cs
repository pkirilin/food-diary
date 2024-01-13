using FoodDiary.Application.Abstractions;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.ComponentTests.Infrastructure.DateAndTime;

public static class FakeDateAndTimeExtensions
{
    public static void AddFakeDateAndTime(this IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, FakeDateTimeProvider>();
        services.AddSingleton<TimeProvider, FakeDateTimeProvider>();
    }
}