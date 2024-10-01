using FoodDiary.API.Features.WeightTracking.Contracts;
using FoodDiary.Domain.WeightTracking;

namespace FoodDiary.API.Features.WeightTracking;

public static class Mappings
{
    public static WeightLogItem ToWeightLogItem(this WeightLog weightLog) => new(weightLog.Date, weightLog.Weight);
}