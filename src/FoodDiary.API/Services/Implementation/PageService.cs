using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Enums;
using System;

namespace FoodDiary.API.Services.Implementation
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

            searchPagesQuery = _pageRepository.LoadNotesWithProducts(searchPagesQuery);
            return await _pageRepository.GetListFromQueryAsync(searchPagesQuery, cancellationToken);
        }

        public async Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _pageRepository.GetByIdAsync(pageId, cancellationToken);
        }

        public async Task<IEnumerable<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
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

        public async Task<ValidationResultDto> ValidatePageAsync(PageCreateEditDto createPageInfo, CancellationToken cancellationToken)
        {
            var query = _pageRepository.GetQueryWithoutTracking()
                .Where(p => p.Date == createPageInfo.Date);
            var pagesWithTheSameDate = await _pageRepository.GetListFromQueryAsync(query, cancellationToken);

            if (pagesWithTheSameDate.Any())
            {
                return new ValidationResultDto(false, $"{nameof(createPageInfo.Date)}", $"Page with such date already exists");
            }

            return new ValidationResultDto(true);
        }

        public async Task EditPageAsync(Page page, CancellationToken cancellationToken)
        {
            _pageRepository.Update(page);
            await _pageRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public bool IsEditedPageValid(PageCreateEditDto updatedPageInfo, Page originalPage, ValidationResultDto editedPageValidationResult)
        {
            bool pageHasChanges = originalPage.Date != updatedPageInfo.Date;
            return !pageHasChanges || (pageHasChanges && editedPageValidationResult.IsValid);
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
    }
}
