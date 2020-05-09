using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class ImportService : IImportService
    {
        public async Task<PagesJsonExportDto> DeserializePagesFromJsonAsync(Stream importFileStream, CancellationToken cancellationToken)
        {
            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            try
            {
                return await JsonSerializer.DeserializeAsync<PagesJsonExportDto>(importFileStream, options, cancellationToken);
            }
            catch (JsonException)
            {
                throw new ImportException("Failed to import pages: import file has incorrect format");
            }
        }

        public Task RunPagesJsonImportAsync(CancellationToken cancellationToken)
        {
            throw new System.NotImplementedException();
        }
    }
}
