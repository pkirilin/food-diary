using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Import.Models;

namespace FoodDiary.API.Services
{
    public interface IImportService
    {
        /// <summary>
        /// Deserializes diary pages with all data from specific JSON format, checking if deserialization successful
        /// </summary>
        /// <exception cref="ImportException"></exception>
        /// <returns>Deserialized JSON object</returns>
        Task<PagesJsonObject> DeserializePagesFromJsonAsync(Stream importFileStream, CancellationToken cancellationToken);

        /// <summary>
        /// Validates specified JSON object,
        /// loads existing entities for update and runs import service,
        /// updating existing and creating new entities from JSON object fields
        /// </summary>
        /// <param name="jsonObj">JSON object data with pages info</param>
        /// <param name="cancellationToken"></param>
        Task RunPagesJsonImportAsync(PagesJsonObject jsonObj, CancellationToken cancellationToken);
    }
}
