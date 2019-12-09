using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using FoodDiary.Domain.Enums;
using System;

namespace FoodDiary.Infrastructure.Services
{
    public class PageService : IPageService
    {
        private readonly IPageRepository _pageRepository;

        public PageService(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository ?? throw new ArgumentNullException(nameof(pageRepository));
        }

        public async Task<IEnumerable<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken)
        {
            var searchPagesQuery = _pageRepository.GetQueryWithoutTracking();

            switch (pageFilter.SortOrder)
            {
                case SortOrder.Ascending:
                    searchPagesQuery = searchPagesQuery.OrderBy(p => p.Date);
                    break;
                default:
                    searchPagesQuery = searchPagesQuery.OrderByDescending(p => p.Date);
                    break;
            }

            if (pageFilter.ShowCount.HasValue)
                searchPagesQuery = searchPagesQuery.Take(pageFilter.ShowCount.Value);

            return await _pageRepository.GetListFromQuery(searchPagesQuery, cancellationToken);
        }

        public async Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _pageRepository.GetByIdAsync(pageId, cancellationToken);
        }

        public async Task<IEnumerable<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            var pagesByIdsQuery = _pageRepository.GetQuery()
                .Where(p => ids.Contains(p.Id));
            return await _pageRepository.GetListFromQuery(pagesByIdsQuery, cancellationToken);
        }

        public async Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken)
        {
            return await _pageRepository.CreateAsync(page, cancellationToken);
        }

        public async Task<bool> PageCanBeCreatedAsync(PageCreateEditDto createPageInfo, CancellationToken cancellationToken)
        {
            return !await _pageRepository.IsDuplicateAsync(createPageInfo.Date, cancellationToken);
        }

        public async Task<Page> EditPageAsync(Page page, CancellationToken cancellationToken)
        {
            return await _pageRepository.UpdateAsync(page, cancellationToken);
        }

        public async Task<bool> PageCanBeUpdatedAsync(PageCreateEditDto updatedPageInfo, Page originalPage, CancellationToken cancellationToken)
        {
            return !originalPage.HasChanges(updatedPageInfo.Date)
                || (originalPage.HasChanges(updatedPageInfo.Date) && !await _pageRepository.IsDuplicateAsync(updatedPageInfo.Date, cancellationToken));
        }

        public async Task<Page> DeletePageAsync(Page page, CancellationToken cancellationToken)
        {
            return await _pageRepository.DeleteAsync(page, cancellationToken);
        }

        public async Task<IEnumerable<Page>> BatchDeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken)
        {
            return await _pageRepository.DeleteRangeAsync(pages, cancellationToken);
        }
    }
}
