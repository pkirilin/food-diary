using System;
using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Export;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class ExportRequestDto
{
    public DateTime StartDate { get; set; }
    
    public DateTime EndDate { get; set; }
}