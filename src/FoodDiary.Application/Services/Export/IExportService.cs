using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Application.Services.Export;

public interface IExportService
{
    Task ExportToGoogleDocsAsync(ExportToGoogleDocsRequestDto request, CancellationToken cancellationToken);
}