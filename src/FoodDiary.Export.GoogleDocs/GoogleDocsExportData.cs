using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Export.GoogleDocs;

[SuppressMessage("ReSharper", "PropertyCanBeMadeInitOnly.Global")]
public class GoogleDocsExportData
{
    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public Page[] Pages { get; set; } = Array.Empty<Page>();

    public string AccessToken { get; set; } = null!;
}