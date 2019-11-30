using System.Collections.Generic;
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
            _categoryRepository = categoryRepository;
        }

        public async Task<IEnumerable<Category>> GetCategoriesAsync(CancellationToken cancellationToken)
        {
            return await _categoryRepository.GetAllAsync(cancellationToken);
        }

        public async Task<Category> GetCategoryByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _categoryRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<bool> CategoryCanBeCreatedAsync(CategoryCreateEditDto newCategoryInfo, CancellationToken cancellationToken)
        {
            return !await _categoryRepository.IsDuplicateAsync(newCategoryInfo.Name, cancellationToken);
        }

        public async Task<bool> CategoryCanBeUpdatedAsync(CategoryCreateEditDto updatedCategoryInfo, Category originalCategory, CancellationToken cancellationToken)
        {
            return !originalCategory.HasChanges(updatedCategoryInfo.Name)
                || (originalCategory.HasChanges(updatedCategoryInfo.Name) && !await _categoryRepository.IsDuplicateAsync(updatedCategoryInfo.Name, cancellationToken));
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
    }
}
