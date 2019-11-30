using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken);

        Task<Category> GetCategoryByIdAsync(int id, CancellationToken cancellationToken);

        Task<bool> CategoryCanBeCreatedAsync(CategoryCreateEditDto newCategoryInfo, CancellationToken cancellationToken);

        Task<bool> CategoryCanBeUpdatedAsync(CategoryCreateEditDto updatedCategoryInfo, Category originalCategory, CancellationToken cancellationToken);

        Task<Category> CreateCategoryAsync(Category category, CancellationToken cancellationToken);

        Task<Category> EditCategoryAsync(Category category, CancellationToken cancellationToken);

        Task<Category> DeleteCategoryAsync(Category category, CancellationToken cancellationToken);
    }
}
