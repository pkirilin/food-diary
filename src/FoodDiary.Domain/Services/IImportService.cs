using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Domain.Services
{
    public interface IImportService
    {
        Task<PagesJsonExportDto> DeserializePagesFromJsonAsync(Stream importFileStream, CancellationToken cancellationToken);

        Task RunPagesJsonImportAsync(CancellationToken cancellationToken);
    }
}
