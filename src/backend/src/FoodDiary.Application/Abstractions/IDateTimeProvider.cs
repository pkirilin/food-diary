using System;

namespace FoodDiary.Application.Abstractions;

public interface IDateTimeProvider
{
    DateTime Now { get; }
}