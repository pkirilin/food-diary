using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Services.Export.GoogleDocs;
using FoodDiary.Domain.Abstractions.v2;

namespace FoodDiary.Application.Services.Export;

internal class ExportService : IExportService
{
    private readonly IFoodDiaryUnitOfWork _unitOfWork;
    private readonly IGoogleDocsExportService _googleDocs;

    public ExportService(IFoodDiaryUnitOfWork unitOfWork, IGoogleDocsExportService googleDocs)
    {
        _unitOfWork = unitOfWork;
        _googleDocs = googleDocs;
    }
    
    public async Task ExportToGoogleDocsAsync(ExportToGoogleDocsRequestDto request, CancellationToken cancellationToken)
    {
        var pages = await _unitOfWork.Pages.GetAsync(request.StartDate, request.EndDate, cancellationToken);
        await _googleDocs.ExportAsync(pages, request.AccessToken, cancellationToken);
    }
}