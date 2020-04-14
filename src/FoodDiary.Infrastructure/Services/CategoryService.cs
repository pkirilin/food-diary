using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken)
        {
            var query = _categoryRepository.GetQueryWithoutTracking();
            query = _categoryRepository.LoadProducts(query);
            query = query.OrderBy(c => c.Name);
            return await _categoryRepository.GetListFromQueryAsync(query, cancellationToken);
        }

        public async Task<Category> GetCategoryByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _categoryRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<ValidationResultDto> ValidateCategoryAsync(CategoryCreateEditDto newCategoryInfo, CancellationToken cancellationToken)
        {
            if (await _categoryRepository.IsDuplicateAsync(newCategoryInfo.Name, cancellationToken))
            {
                return new ValidationResultDto(false, $"{nameof(newCategoryInfo.Name)}", $"Category with the name '{newCategoryInfo.Name}' already exists");
            }

            return new ValidationResultDto(true);
        }

        public bool IsEditedCategoryValid(CategoryCreateEditDto updatedCategoryInfo, Category originalCategory, ValidationResultDto editedCategoryValidationResult)
        {
            bool categoryHasChanges = originalCategory.Name != updatedCategoryInfo.Name;
            return !categoryHasChanges || (categoryHasChanges && editedCategoryValidationResult.IsValid);
        }

        public async Task<Category> CreateCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            var createdCategory = _categoryRepository.Create(category);
            await _categoryRepository.SaveChangesAsync(cancellationToken);
            return createdCategory;
        }

        public async Task<Category> EditCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            var updatedCategory = _categoryRepository.Update(category);
            await _categoryRepository.SaveChangesAsync(cancellationToken);
            return updatedCategory;
        }

        public async Task<Category> DeleteCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            var deletedCategory = _categoryRepository.Delete(category);
            await _categoryRepository.SaveChangesAsync(cancellationToken);
            return deletedCategory;
        }

        public async Task<IEnumerable<Category>> GetCategoriesDropdownAsync(CancellationToken cancellationToken)
        {
            var query = _categoryRepository.GetQueryWithoutTracking().OrderBy(c => c.Name);
            var categories = await _categoryRepository.GetListFromQueryAsync(query, cancellationToken);
            return categories;
        }
    }
}
