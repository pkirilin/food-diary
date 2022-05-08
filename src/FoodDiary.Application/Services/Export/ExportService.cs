using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Services.Export.DataLoader;
using FoodDiary.Export.GoogleDocs;

namespace FoodDiary.Application.Services.Export;

internal class ExportService : IExportService
{
    private readonly IExportDataLoader _exportDataLoader;
    private readonly IGoogleDocsExportService _googleDocs;

    public ExportService(IExportDataLoader exportDataLoader, IGoogleDocsExportService googleDocs)
    {
        _exportDataLoader = exportDataLoader;
        _googleDocs = googleDocs;
    }
    
    public async Task ExportToGoogleDocsAsync(ExportToGoogleDocsRequestDto request, CancellationToken cancellationToken)
    {
        var exportFileDto = await _exportDataLoader.GetExportDataAsync(request.StartDate, request.EndDate, cancellationToken);

        await _googleDocs.ExportAsync(exportFileDto, request.AccessToken, cancellationToken);
    }
}