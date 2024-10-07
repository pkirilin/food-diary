using System;
using System.Collections.Generic;

namespace FoodDiary.API.Features.WeightTracking.Contracts;

public record GetWeightLogsRequest(DateOnly From, DateOnly To);

public record GetWeightLogsResponse(IReadOnlyCollection<WeightLogItem> WeightLogs);

public record WeightLogItem(DateOnly Date, decimal Value);