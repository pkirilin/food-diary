using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Pdf;

namespace FoodDiary.Infrastructure.Services
{
    public class ExportService : IExportService
    {
        private readonly IPageRepository _pageRepository;
        private readonly IPagesPdfGenerator _pagesPdfGenerator;

        public ExportService(IPageRepository pageRepository, IPagesPdfGenerator pagesPdfGenerator)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
            _pagesPdfGenerator = pagesPdfGenerator ?? throw new ArgumentNullException(nameof(pagesPdfGenerator));
        }

        public async Task<byte[]> GetExportPagesPdfContentsAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            var pagesForExportQuery = _pageRepository.GetQueryWithoutTracking()
                .Where(p => p.Date >= startDate && p.Date <= endDate);
            pagesForExportQuery = _pageRepository.LoadNotesWithProducts(pagesForExportQuery);
            pagesForExportQuery = pagesForExportQuery.OrderBy(p => p.Date);

            var pagesForExport = await _pageRepository.GetListFromQueryAsync(pagesForExportQuery, cancellationToken);
            var pdfFileContents = _pagesPdfGenerator.GeneratePdfForPages(pagesForExport);
            return pdfFileContents;
        }
    }
}
