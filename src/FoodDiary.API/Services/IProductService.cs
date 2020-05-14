using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Services
{
    public interface IProductService
    {
        Task<ProductSearchMetadata> SearchProductsAsync(ProductsSearchRequestDto searchRequest, CancellationToken cancellationToken);

        Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken);

        Task EditProductAsync(Product product, CancellationToken cancellationToken);

        Task DeleteProductAsync(Product product, CancellationToken cancellationToken);

        Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidateProductAsync(ProductCreateEditDto productData, CancellationToken cancellationToken);

        bool IsEditedProductValid(ProductCreateEditDto editedProductData, Product originalProduct, ValidationResultDto editedProductValidationResult);

        ValidationResultDto AllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds);

        Task<IEnumerable<Product>> GetProductsDropdownListAsync(ProductDropdownSearchRequestDto request, CancellationToken cancellationToken);
    }
}
