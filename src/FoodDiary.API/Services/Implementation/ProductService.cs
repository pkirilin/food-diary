using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Metadata;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.API.Services.Implementation
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        public async Task<ProductsSearchResultMetadata> SearchProductsAsync(ProductsSearchRequest searchRequest, CancellationToken cancellationToken)
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

            var totalProductsCount = await _productRepository.CountByQueryAsync(searchQuery, cancellationToken);

            searchQuery = searchQuery.OrderBy(p => p.Name);
            searchQuery = searchQuery.Skip((searchRequest.PageNumber - 1) * searchRequest.PageSize)
                .Take(searchRequest.PageSize);
            searchQuery = _productRepository.LoadCategory(searchQuery);

            var products = await _productRepository.GetListFromQueryAsync(searchQuery, cancellationToken);

            return new ProductsSearchResultMetadata()
            {
                FoundProducts = products,
                TotalProductsCount = totalProductsCount
            };
        }

        public async Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await _productRepository.GetByIdAsync(id, cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken)
        {
            return await _productRepository.GetByIdsAsync(ids, cancellationToken);
        }

        public async Task<bool> IsProductExistsAsync(string productName, CancellationToken cancellationToken)
        {
            var query = _productRepository
                .GetQueryWithoutTracking()
                .Where(p => p.Name == productName);

            var productsWithTheSameName = await _productRepository.GetListFromQueryAsync(query, cancellationToken);

            return productsWithTheSameName.Any();
        }

        public bool IsEditedProductValid(ProductCreateEditRequest editedProductData, Product originalProduct, bool isProductExists)
        {
            bool productHasChanges = editedProductData.Name != originalProduct.Name;
            return !productHasChanges || (productHasChanges && !isProductExists);
        }

        public bool AreAllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds)
        {
            var fetchedProductsIds = fetchedProducts.Select(p => p.Id);
            return !requestedIds.Except(fetchedProductsIds).Any();
        }

        public async Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken)
        {
            var createdProduct = _productRepository.Create(product);
            await _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return createdProduct;
        }

        public async Task EditProductAsync(Product product, CancellationToken cancellationToken)
        {
            _productRepository.Update(product);
            await _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteProductAsync(Product product, CancellationToken cancellationToken)
        {
            _productRepository.Delete(product);
            await _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken)
        {
            _productRepository.DeleteRange(products);
            await _productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<Product>> GetProductsDropdownAsync(ProductDropdownSearchRequest request, CancellationToken cancellationToken)
        {
            var query = _productRepository.GetQueryWithoutTracking();

            if (!String.IsNullOrWhiteSpace(request.ProductNameFilter))
            {
                query = query.Where(p => p.Name.Contains(request.ProductNameFilter));
            }

            query = query.OrderBy(p => p.Name);
            var products = await _productRepository.GetListFromQueryAsync(query, cancellationToken);
            return products;
        }
    }
}
