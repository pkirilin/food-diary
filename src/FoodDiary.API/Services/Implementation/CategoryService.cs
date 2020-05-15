using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.API.Services.Implementation
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

        public async Task<bool> IsCategoryExistsAsync(string categoryName, CancellationToken cancellationToken)
        {
            var query = _categoryRepository
                .GetQueryWithoutTracking()
                .Where(c => c.Name == categoryName);
            
            var categoriesWithTheSameName = await _categoryRepository.GetListFromQueryAsync(query, cancellationToken);

            return categoriesWithTheSameName.Any();
        }

        public bool IsEditedCategoryValid(CategoryCreateEditRequest updatedCategoryInfo, Category originalCategory, bool isCategoryExists)
        {
            bool categoryHasChanges = originalCategory.Name != updatedCategoryInfo.Name;
            return !categoryHasChanges || (categoryHasChanges && !isCategoryExists);
        }

        public async Task<Category> CreateCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            var createdCategory = _categoryRepository.Create(category);
            await _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdCategory;
        }

        public async Task EditCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            _categoryRepository.Update(category);
            await _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken)
        {
            _categoryRepository.Delete(category);
            await _categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<Category>> GetCategoriesDropdownAsync(CategoryDropdownSearchRequest request, CancellationToken cancellationToken)
        {
            var query = _categoryRepository.GetQueryWithoutTracking();

            if (!String.IsNullOrWhiteSpace(request.CategoryNameFilter))
            {
                query = query.Where(c => c.Name.Contains(request.CategoryNameFilter));
            }

            query = query.OrderBy(c => c.Name);
            var categories = await _categoryRepository.GetListFromQueryAsync(query, cancellationToken);
            return categories;
        }
    }
}
