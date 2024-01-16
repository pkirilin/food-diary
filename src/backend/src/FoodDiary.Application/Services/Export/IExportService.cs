using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Export;

public interface IExportService
{
    Task<ExportToGoogleDocsResponseDto> ExportToGoogleDocsAsync(
        ExportToGoogleDocsRequestDto request,
        string accessToken,
        CancellationToken cancellationToken);

    Task<byte[]> ExportToJsonAsync(ExportRequestDto request, CancellationToken cancellationToken);
}