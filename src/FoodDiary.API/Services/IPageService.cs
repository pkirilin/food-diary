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
        /// <summary>
        /// Gets pages by specified parameters
        /// </summary>
        Task<IEnumerable<Page>> SearchPagesAsync(PagesSearchRequest pagesRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Gets page by specified id
        /// </summary>
        Task<Page> GetPageByIdAsync(int pageId, CancellationToken cancellationToken);

        /// <summary>
        /// Gets pages by specified ids
        /// </summary>
        Task<ICollection<Page>> GetPagesByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        /// <summary>
        /// Creates new page
        /// </summary>
        /// <returns>Created page</returns>
        Task<Page> CreatePageAsync(Page page, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if page with specified date exists
        /// </summary>
        Task<bool> IsPageExistsAsync(DateTime pageDate, CancellationToken cancellationToken);

        /// <summary>
        /// Updates existing page
        /// </summary>
        Task EditPageAsync(Page page, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if page valid after it was updated
        /// </summary>
        /// <param name="updatedPageData">Updated page info</param>
        /// <param name="originalPage">Page before update</param>
        /// <param name="isPageExists">Indicates if page with the same date already exists</param>
        bool IsEditedPageValid(PageCreateEditRequest updatedPageData, Page originalPage, bool isPageExists);

        /// <summary>
        /// Deletes existing page
        /// </summary>
        Task DeletePageAsync(Page page, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes existing pages
        /// </summary>
        Task DeletePagesAsync(IEnumerable<Page> pages, CancellationToken cancellationToken);

        /// <summary>
        /// Gets suggested date for next page that is going to be created
        /// </summary>
        Task<DateTime> GetDateForNewPageAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Ensures that start date is always less or equal than end date
        /// </summary>
        bool AreDateRangesValid(DateTime? startDate, DateTime? endDate);
    }
}
