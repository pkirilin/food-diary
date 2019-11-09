using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface IPageService
    {
        Task<ICollection<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken = default);

        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken = default);

        Task<ICollection<Page>> GetPagesByIdsAsync(ICollection<int> ids, CancellationToken cancellationToken = default);

        Task<int> CreatePageAsync(Page page, CancellationToken cancellationToken = default);

        Task<bool> PageCanBeCreatedAsync(PageCreateDto createPageInfo, CancellationToken cancellationToken = default);

        Task EditPageAsync(Page page, CancellationToken cancellationToken = default);

        Task<bool> PageCanBeUpdatedAsync(PageEditDto updatedPageInfo, Page originalPage, CancellationToken cancellationToken = default);

        Task DeletePageAsync(Page page, CancellationToken cancellationToken = default);

        Task BatchDeletePagesAsync(ICollection<Page> pages, CancellationToken cancellationToken = default);
    }
}
