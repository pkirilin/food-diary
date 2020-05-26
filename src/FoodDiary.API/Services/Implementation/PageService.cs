using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Enums;
using System;
using FoodDiary.API.Requests;

namespace FoodDiary.API.Services.Implementation
{
    public class PageService : IPageService
    {
        private readonly IPageRepository _pageRepository;

        public PageService(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public async Task<IEnumerable<Page>> SearchPagesAsync(PagesSearchRequest request, CancellationToken cancellationToken)
        {
            var searchPagesQuery = _pageRepository.GetQueryWithoutTracking();

            if (request.StartDate.HasValue)
                searchPagesQuery = searchPagesQuery.Where(p => p.Date >= request.StartDate);
            if (request.EndDate.HasValue)
                searchPagesQuery = searchPagesQuery.Where(p => p.Date <= request.EndDate);

            switch (request.SortOrder)
            {
                case SortOrder.Ascending:
                    searchPagesQuery = searchPagesQuery.OrderBy(p => p.Date);
                    break;
                case SortOrder.Descending:
                    searchPagesQuery = searchPagesQuery.OrderByDescending(p => p.Date);
                    break;
                default:
                    break;
            }

            searchPagesQuery = _pageRepository.LoadNotesWithProducts(searchPagesQuery);
            return await _pageRepository.GetListFromQueryAsync(searchPagesQuery, cancellationToken);
        }

        public async Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _pageRepository.GetByIdAsync(pageId, cancellationToken);
        }

        public async Task<ICollection<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            var pagesByIdsQuery = _pageRepository.GetQuery()
                .Where(p => ids.Contains(p.Id));
            return await _pageRepository.GetListFromQueryAsync(pagesByIdsQuery, cancellationToken);
        }

        public async Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken)
        {
            var createdPage = _pageRepository.Add(page);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdPage;
        }

        public async Task<bool> IsPageExistsAsync(DateTime pageDate, CancellationToken cancellationToken)
        {
            var query = _pageRepository
                .GetQueryWithoutTracking()
                .Where(p => p.Date == pageDate);

            var pagesWithTheSameDate = await _pageRepository.GetListFromQueryAsync(query, cancellationToken);

            return pagesWithTheSameDate.Any();
        }

        public async Task EditPageAsync(Page page, CancellationToken cancellationToken)
        {
            _pageRepository.Update(page);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public bool IsEditedPageValid(PageCreateEditRequest updatedPageData, Page originalPage, bool isPageExists)
        {
            bool pageHasChanges = originalPage.Date != updatedPageData.Date;
            return !pageHasChanges || (pageHasChanges && !isPageExists);
        }

        public async Task DeletePageAsync(Page page, CancellationToken cancellationToken)
        {
            _pageRepository.Delete(page);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task BatchDeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken)
        {
            _pageRepository.DeleteRange(pages);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<DateTime> GetDateForNewPageAsync(CancellationToken cancellationToken)
        {
            var query = _pageRepository.GetQueryWithoutTracking()
                .OrderByDescending(p => p.Date)
                .Take(1);

            var pages = await _pageRepository.GetListFromQueryAsync(query, cancellationToken);

            if (pages.Any())
                return pages.First().Date.AddDays(1);

            return DateTime.Now.Date;
        }

        public bool AreDateRangesValid(DateTime? startDate, DateTime? endDate)
        {
            if (startDate.HasValue && endDate.HasValue && startDate > endDate)
                return false;
            return true;
        }
    }
}
