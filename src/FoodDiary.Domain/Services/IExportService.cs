using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface IExportService
    {
        Task<IEnumerable<Page>> GetPagesForExportAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
    }
}
