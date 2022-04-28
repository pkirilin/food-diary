using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Services.Export.GoogleDocs;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Services.Export;

internal class ExportService : IExportService
{
    private readonly IGoogleDocsExportService _googleDocs;

    public ExportService(IGoogleDocsExportService googleDocs)
    {
        _googleDocs = googleDocs;
    }
    
    public async Task ExportToGoogleDocsAsync(ExportToGoogleDocsRequestDto request, CancellationToken cancellationToken)
    {
        var pages = await GetPagesForExportAsync(request.StartDate, request.EndDate, cancellationToken);
        await _googleDocs.ExportAsync(pages, request.AccessToken, cancellationToken);
    }

    private async Task<Page[]> GetPagesForExportAsync(DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken)
    {
        throw new System.NotImplementedException();
    }
}