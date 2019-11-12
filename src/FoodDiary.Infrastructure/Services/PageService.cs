using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;
using Microsoft.EntityFrameworkCore;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Infrastructure.Services
{
    public class PageService : IPageService
    {
        private readonly IPageRepository _pageRepository;

        public PageService(IPageRepository pageRepository)
        {
            _pageRepository = pageRepository;
        }

        public async Task<ICollection<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken)
        {
            var searchPagesQuery = _pageRepository.Get()
                .AsNoTracking();

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

            return await searchPagesQuery.ToListAsync(cancellationToken);
        }

        public async Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken)
        {
            return await _pageRepository.GetByIdAsync(pageId, cancellationToken);
        }

        public async Task<ICollection<Page>> GetPagesByIdsAsync(ICollection<int> ids, CancellationToken cancellationToken)
        {
            return await _pageRepository.Get()
                .Where(p => ids.Contains(p.Id))
                .ToListAsync(cancellationToken);
        }

        public async Task<int> CreatePageAsync(Page page, CancellationToken cancellationToken)
        {
            var createdPageId = await _pageRepository.CreateAsync(page, cancellationToken);
            return createdPageId;
        }

        public async Task<bool> PageCanBeCreatedAsync(PageCreateDto createPageInfo, CancellationToken cancellationToken)
        {
            return !await _pageRepository.IsDuplicateAsync(createPageInfo.Date, cancellationToken);
        }

        public async Task EditPageAsync(Page page, CancellationToken cancellationToken)
        {
            await _pageRepository.UpdateAsync(page, cancellationToken);
        }

        public async Task<bool> PageCanBeUpdatedAsync(PageEditDto updatedPageInfo, Page originalPage, CancellationToken cancellationToken)
        {
            if (!originalPage.HasChanges(updatedPageInfo.Date)
                || (originalPage.HasChanges(updatedPageInfo.Date) && !await _pageRepository.IsDuplicateAsync(updatedPageInfo.Date, cancellationToken)))
            {
                return true;
            }

            return false;
        }

        public async Task DeletePageAsync(Page page, CancellationToken cancellationToken)
        {
            await _pageRepository.DeleteAsync(page, cancellationToken);
        }

        public async Task BatchDeletePagesAsync(ICollection<Page> pages, CancellationToken cancellationToken)
        {
            await _pageRepository.DeleteRangeAsync(pages, cancellationToken);
        }
    }
}
