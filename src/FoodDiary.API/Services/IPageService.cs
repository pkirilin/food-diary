using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface IPageService
    {
        Task<IEnumerable<Page>> SearchPagesAsync(PagesSearchRequest pageFilter, CancellationToken cancellationToken);

        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken);

        Task<ICollection<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken);

        Task<bool> IsPageExistsAsync(DateTime pageDate, CancellationToken cancellationToken);

        Task EditPageAsync(Page page, CancellationToken cancellationToken);

        bool IsEditedPageValid(PageCreateEditRequest updatedPageInfo, Page originalPage, bool isPageExists);

        Task DeletePageAsync(Page page, CancellationToken cancellationToken);

        Task BatchDeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);
    }
}
