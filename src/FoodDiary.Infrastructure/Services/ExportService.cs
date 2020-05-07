using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class ExportService : IExportService
    {
        private readonly IPageRepository _pageRepository;

        public ExportService(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public async Task<IEnumerable<Page>> GetPagesForExportAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            var pagesForExportQuery = _pageRepository.GetQueryWithoutTracking()
                .Where(p => p.Date >= startDate && p.Date <= endDate);
            pagesForExportQuery = _pageRepository.LoadNotesWithProducts(pagesForExportQuery);
            pagesForExportQuery = pagesForExportQuery.OrderBy(p => p.Date);

            var pagesForExport = await _pageRepository.GetListFromQueryAsync(pagesForExportQuery, cancellationToken);
            return pagesForExport;
        }
    }
}
