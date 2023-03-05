using FoodDiary.Export.GoogleDocs.Contracts;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsExportService
{
    Task<string> ExportAsync(ExportRequest request, CancellationToken cancellationToken);
}