using FoodDiary.Domain.Entities;

namespace FoodDiary.Export.GoogleDocs;

public class GoogleDocsExportData
{
    public DateTime StartDate { get; init; }

    public DateTime EndDate { get; init; }

    public Page[] Pages { get; init; } = Array.Empty<Page>();

    public string AccessToken { get; init; } = null!;
}