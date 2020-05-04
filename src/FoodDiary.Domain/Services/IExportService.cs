using System;
using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Domain.Services
{
    public interface IExportService
    {
        Task<byte[]> GetExportPagesPdfContentsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
    }
}
