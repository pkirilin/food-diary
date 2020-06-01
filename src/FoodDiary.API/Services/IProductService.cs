using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Metadata;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface IProductService
    {
        /// <summary>
        /// Gets products by specified parameters
        /// </summary>
        Task<ProductsSearchResultMetadata> SearchProductsAsync(ProductsSearchRequest productsRequest, CancellationToken cancellationToken);

        /// <summary>
        /// Gets product by specified id
        /// </summary>
        Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken);

        /// <summary>
        /// Gets products by specified ids
        /// </summary>
        Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        /// <summary>
        /// Creates new product
        /// </summary>
        /// <returns>Created product</returns>
        Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken);

        /// <summary>
        /// Updates existing product
        /// </summary>
        Task EditProductAsync(Product product, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes existing product
        /// </summary>
        Task DeleteProductAsync(Product product, CancellationToken cancellationToken);

        /// <summary>
        /// Deletes existing products
        /// </summary>
        Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if product with specified name exists
        /// </summary>
        Task<bool> IsProductExistsAsync(string productName, CancellationToken cancellationToken);

        /// <summary>
        /// Checks if product valid after it was updated
        /// </summary>
        /// <param name="updatedProductData">Updated product info</param>
        /// <param name="originalProduct">Product before update</param>
        /// <param name="isProductExists">Indicates if product with the same name already exists</param>
        bool IsEditedProductValid(ProductCreateEditRequest updatedProductData, Product originalProduct, bool isProductExists);

        /// <summary>
        /// Ensures if all requested products ids contain in fetched products
        /// </summary>
        /// <param name="fetchedProducts">Fetched products</param>
        /// <param name="requestedIds">Requested products ids</param>
        bool AreAllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds);

        /// <summary>
        /// Gets requested products for dropdown list by specified parameters
        /// </summary>
        Task<IEnumerable<Product>> GetProductsDropdownAsync(ProductDropdownSearchRequest productsDropdownRequest, CancellationToken cancellationToken);
    }
}
