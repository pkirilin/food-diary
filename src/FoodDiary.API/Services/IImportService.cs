using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.API.Services
{
    public interface IImportService
    {
        Task<PagesJsonObjectDto> DeserializePagesFromJsonAsync(Stream importFileStream, CancellationToken cancellationToken);

        Task RunPagesJsonImportAsync(PagesJsonObjectDto jsonObj, CancellationToken cancellationToken);
    }
}
