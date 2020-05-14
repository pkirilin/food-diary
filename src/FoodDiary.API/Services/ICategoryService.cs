using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken);

        Task<Category> GetCategoryByIdAsync(int id, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidateCategoryAsync(CategoryCreateEditRequest newCategoryInfo, CancellationToken cancellationToken);

        bool IsEditedCategoryValid(CategoryCreateEditRequest updatedCategoryInfo, Category originalCategory, ValidationResultDto editedCategoryValidationResult);

        Task<Category> CreateCategoryAsync(Category category, CancellationToken cancellationToken);

        Task EditCategoryAsync(Category category, CancellationToken cancellationToken);

        Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken);

        Task<IEnumerable<Category>> GetCategoriesDropdownAsync(CategoryDropdownSearchRequest request, CancellationToken cancellationToken);
    }
}
