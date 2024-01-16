using System;
using JetBrains.Annotations;

namespace FoodDiary.Application.Services.Export;

[PublicAPI]
public class ExportToGoogleDocsRequestDto
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}