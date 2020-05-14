using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Import.Models;

namespace FoodDiary.API.Services
{
    public interface IImportService
    {
        Task<PagesJsonObject> DeserializePagesFromJsonAsync(Stream importFileStream, CancellationToken cancellationToken);

        Task RunPagesJsonImportAsync(PagesJsonObject jsonObj, CancellationToken cancellationToken);
    }
}
