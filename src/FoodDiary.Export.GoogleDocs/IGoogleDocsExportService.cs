namespace FoodDiary.Export.GoogleDocs;

public interface IGoogleDocsExportService
{
    Task ExportAsync(GoogleDocsExportData exportData, CancellationToken cancellationToken);
}