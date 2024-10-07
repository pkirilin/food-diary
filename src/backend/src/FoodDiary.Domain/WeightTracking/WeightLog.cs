using System;

namespace FoodDiary.Domain.WeightTracking;

public class WeightLog
{
    public required DateOnly Date { get; init; }
    public required decimal Weight { get; init; }
}