using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface ICategoryService
    {
        /// <summary>
        /// Gets all available categories ordered by name
        /// </summary>
        Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken);

        /// <summary>
        /// Gets category by specified id
        /// </summary>
        Task<Category> GetCategoryByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if category with specified name exists in database
        /// </summary>
        Task<bool> IsCategoryExistsAsync(string categoryName, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if category valid after it was updated
        /// </summary>
        /// <param name="updatedCategoryData">Category info after update</param>
        /// <param name="originalCategory">Category info before update</param>
        /// <param name="isCategoryExists">Indicates if category with the same name already exists or not</param>
        bool IsEditedCategoryValid(CategoryCreateEditRequest updatedCategoryData, Category originalCategory, bool isCategoryExists);

        /// <summary>
        /// Creates new category
        /// </summary>
        /// <returns>Created category</returns>
        Task<Category> CreateCategoryAsync(Category category, CancellationToken cancellationToken);

        /// <summary>
        /// Updates existing category
        /// </summary>
        Task EditCategoryAsync(Category category, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes existing category
        /// </summary>
        Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken);

        /// <summary>
        /// Gets requested categories for dropdown list by specified parameters
        /// </summary>
        Task<IEnumerable<Category>> GetCategoriesDropdownAsync(CategoryDropdownSearchRequest categoriesDropdownRequest, CancellationToken cancellationToken);
    }
}
