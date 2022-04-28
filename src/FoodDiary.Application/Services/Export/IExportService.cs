using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Services.Export.GoogleDocs;

namespace FoodDiary.Application.Services.Export;

public interface IExportService
{
    Task ExportToGoogleDocsAsync(ExportGoogleDocsRequestDto request, CancellationToken cancellationToken);
}