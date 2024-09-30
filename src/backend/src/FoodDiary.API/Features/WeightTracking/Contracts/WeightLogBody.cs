using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Features.WeightTracking.Contracts;

public class WeightLogBody
{
    [Required]
    public DateOnly? Date { get; init; }

    [Range(1, 700)]
    public decimal Value { get; init; }
}