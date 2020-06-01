using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface IExportService
    {
        /// <summary>
        /// Gets all pages between specified date ranges
        /// </summary>
        /// <param name="startDate">Date from which pages should start, including page with this date</param>
        /// <param name="endDate">Date from which pages should end, including page with this date</param>
        /// <param name="includeCategory">Flag indicating whether category should be loaded into product data</param>
        /// <param name="cancellationToken"></param>
        Task<IEnumerable<Page>> GetPagesForExportAsync(DateTime startDate, DateTime endDate, bool includeCategory, CancellationToken cancellationToken);
    }
}
