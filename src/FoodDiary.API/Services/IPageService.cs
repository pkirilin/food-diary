using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface IPageService
    {
        Task<IEnumerable<Page>> SearchPagesAsync(PagesSearchRequest pageFilter, CancellationToken cancellationToken);

        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken);

        Task<IEnumerable<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidatePageAsync(PageCreateEditRequest createPageInfo, CancellationToken cancellationToken);

        Task EditPageAsync(Page page, CancellationToken cancellationToken);

        bool IsEditedPageValid(PageCreateEditRequest updatedPageInfo, Page originalPage, ValidationResultDto editedPageValidationResult);

        Task DeletePageAsync(Page page, CancellationToken cancellationToken);

        Task BatchDeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);
    }
}
