using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Application.Services.Export;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class ExportToGoogleDocsResponseDto
{
    public string DocumentId { get; set; }
}