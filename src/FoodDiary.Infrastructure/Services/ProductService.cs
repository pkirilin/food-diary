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
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public async Task<IEnumerable<Product>> SearchProductsAsync(ProductsSearchRequestDto searchRequest, CancellationToken cancellationToken)
        {
            var searchQuery = _productRepository.GetQueryWithoutTracking();

            if (!String.IsNullOrWhiteSpace(searchRequest.ProductSearchName))
            {
                searchQuery = searchQuery.Where(p =>
                    p.Name.ToLower()
                        .StartsWith(searchRequest.ProductSearchName.ToLower()));
            }

            if (searchRequest.CategoryId.HasValue)
            {
                searchQuery = searchQuery.Where(p => p.CategoryId == searchRequest.CategoryId);
            }

            searchQuery = searchQuery.Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize);
            searchQuery = _productRepository.LoadCategory(searchQuery);

            return await _productRepository.GetListFromQueryAsync(searchQuery, cancellationToken);
        }

        public async Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _productRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return await _productRepository.GetByIdsAsync(ids, cancellationToken);
        }

        public async Task<ValidationResultDto> ValidateProductAsync(ProductCreateEditDto productData, CancellationToken cancellationToken)
        {
            if (await _productRepository.IsDuplicateAsync(productData.Name, cancellationToken))
            {
                return new ValidationResultDto(false, $"{nameof(productData.Name)}", $"Product with the name '{productData.Name}' already exists");
            }

            return new ValidationResultDto(true);
        }

        public bool IsEditedProductValid(ProductCreateEditDto editedProductData, Product originalProduct, ValidationResultDto editedProductValidationResult)
        {
            bool productHasChanges = editedProductData.Name != originalProduct.Name;
            return !productHasChanges
                || (productHasChanges && editedProductValidationResult.IsValid);
        }

        public ValidationResultDto AllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds)
        {
            var fetchedProductsIds = fetchedProducts.Select(p => p.Id);
            if (requestedIds.Except(fetchedProductsIds).Any())
            {
                return new ValidationResultDto(false, "Products cannot be deleted: wrong ids specified");
            }

            return new ValidationResultDto(true);
        }

        public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken)
        {
            var createdProduct = _productRepository.Create(product);
            await _productRepository.SaveChangesAsync(cancellationToken);
            return createdProduct;
        }

        public async Task<Product> EditProductAsync(Product product, CancellationToken cancellationToken)
        {
            var updatedProduct = _productRepository.Update(product);
            await _productRepository.SaveChangesAsync(cancellationToken);
            return updatedProduct;
        }

        public async Task<Product> DeleteProductAsync(Product product, CancellationToken cancellationToken)
        {
            var deletedProduct = _productRepository.Delete(product);
            await _productRepository.SaveChangesAsync(cancellationToken);
            return deletedProduct;
        }

        public async Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken)
        {
            _productRepository.DeleteRange(products);
            await _productRepository.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetProductsDropdownListAsync(CancellationToken cancellationToken)
        {
            var query = _productRepository.GetQueryWithoutTracking().OrderBy(p => p.Name);
            var products = await _productRepository.GetListFromQueryAsync(query, cancellationToken);
            return products;
        }
    }
}
