using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;
using JetBrains.Annotations;

namespace FoodDiary.API.Requests;

[PublicAPI]
public class PagesSearchRequest
{
    [EnumDataType(typeof(SortOrder))]
    public SortOrder SortOrder { get; init; } = SortOrder.Descending;

    public DateOnly? StartDate { get; init; }

    public DateOnly? EndDate { get; init; }
        
    [Range(1, int.MaxValue, ErrorMessage = "Invalid page number value specified")]
    public int PageNumber { get; init; } = 1;

    [Range(1, int.MaxValue, ErrorMessage = "Invalid page size value specified")]
    public int PageSize { get; init; } = 10;
}