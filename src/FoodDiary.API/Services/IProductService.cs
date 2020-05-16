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
        Task<ProductsSearchResultMetadata> SearchProductsAsync(ProductsSearchRequest searchRequest, CancellationToken cancellationToken);

        Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken);

        Task EditProductAsync(Product product, CancellationToken cancellationToken);

        Task DeleteProductAsync(Product product, CancellationToken cancellationToken);

        Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken);

        Task<bool> IsProductExistsAsync(string productName, CancellationToken cancellationToken);

        bool IsEditedProductValid(ProductCreateEditRequest editedProductData, Product originalProduct, bool isProductExists);

        bool AreAllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds);

        Task<IEnumerable<Product>> GetProductsDropdownAsync(ProductDropdownSearchRequest request, CancellationToken cancellationToken);
    }
}
