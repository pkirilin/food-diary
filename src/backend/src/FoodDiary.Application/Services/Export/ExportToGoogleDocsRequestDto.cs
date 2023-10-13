using System;
using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Export;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class ExportToGoogleDocsRequestDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}