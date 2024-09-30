using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Features.WeightTracking.Contracts;

public class GetWeightLogsRequest
{
    [Required]
    public DateOnly? From { get; init; }
    
    [Required]
    public DateOnly? To { get; init; }
}

public record GetWeightLogsResponse(IReadOnlyCollection<WeightLogItem> WeightLogs);

public record WeightLogItem(DateOnly Date, decimal Value);