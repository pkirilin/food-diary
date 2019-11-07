using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class PageService : IPageService
    {
        public async Task<ICollection<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<Page> GetPageByIdWithMealsAndNotesAsync(int pageId, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<ICollection<Page>> GetPagesByIdsAsync(ICollection<int> ids, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<int> CreatePageAsync(Page page, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<bool> PageCanBeCreatedAsync(Page page, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task EditPageAsync(Page page, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task<bool> PageCanBeUpdatedAsync(Page page, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task DeletePageAsync(Page page, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }

        public async Task BatchDeletePagesAsync(ICollection<Page> pages, CancellationToken cancellationToken = default)
        {
            throw new System.NotImplementedException();
        }
    }
}
