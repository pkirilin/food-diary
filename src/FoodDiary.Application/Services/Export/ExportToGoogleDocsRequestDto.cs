using System;
using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Export;

[SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
public class ExportToGoogleDocsRequestDto
{
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public string AccessToken { get; set; }
}