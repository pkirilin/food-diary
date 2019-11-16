using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface IPageService
    {
        Task<ICollection<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken);

        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken);

        Task<ICollection<Page>> GetPagesByIdsAsync(ICollection<int> ids, CancellationToken cancellationToken);

        Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken);

        Task<bool> PageCanBeCreatedAsync(PageCreateDto createPageInfo, CancellationToken cancellationToken);

        Task<Page> EditPageAsync(Page page, CancellationToken cancellationToken);

        Task<bool> PageCanBeUpdatedAsync(PageEditDto updatedPageInfo, Page originalPage, CancellationToken cancellationToken);

        Task<Page> DeletePageAsync(Page page, CancellationToken cancellationToken);

        Task<ICollection<Page>> BatchDeletePagesAsync(ICollection<Page> pages, CancellationToken cancellationToken);
    }
}
