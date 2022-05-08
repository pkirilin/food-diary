using FoodDiary.Contracts.Export;

namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsExportService
{
    Task ExportAsync(ExportFileDto exportFileDto, string accessToken, CancellationToken cancellationToken);
}