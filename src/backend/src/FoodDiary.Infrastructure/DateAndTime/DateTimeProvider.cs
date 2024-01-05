using System;
using FoodDiary.Application.Abstractions;

namespace FoodDiary.Infrastructure.DateAndTime;

internal class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.Now;
}