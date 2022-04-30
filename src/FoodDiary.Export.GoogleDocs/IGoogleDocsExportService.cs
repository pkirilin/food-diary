using FoodDiary.Domain.Entities;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsExportService
{
    Task ExportAsync(IEnumerable<Page> pages, string accessToken, CancellationToken cancellationToken);
}