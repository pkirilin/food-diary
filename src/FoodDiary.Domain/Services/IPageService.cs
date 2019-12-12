using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface IPageService
    {
        Task<IEnumerable<Page>> SearchPagesAsync(PageFilterDto pageFilter, CancellationToken cancellationToken);

        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken);

        Task<IEnumerable<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidatePageAsync(PageCreateEditDto createPageInfo, CancellationToken cancellationToken);

        Task<Page> EditPageAsync(Page page, CancellationToken cancellationToken);

        bool IsEditedPageValid(PageCreateEditDto updatedPageInfo, Page originalPage, ValidationResultDto editedPageValidationResult);

        Task<Page> DeletePageAsync(Page page, CancellationToken cancellationToken);

        Task<IEnumerable<Page>> BatchDeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);
    }
}
