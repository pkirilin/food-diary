using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> SearchProductsAsync(ProductsSearchRequestDto searchRequest, CancellationToken cancellationToken);

        Task<Product> GetProductByIdAsync(int id, CancellationToken cancellationToken);

        Task<IEnumerable<Product>> GetProductsByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken);

        Task<Product> CreateProductAsync(Product product, CancellationToken cancellationToken);

        Task<Product> EditProductAsync(Product product, CancellationToken cancellationToken);

        Task<Product> DeleteProductAsync(Product product, CancellationToken cancellationToken);

        Task DeleteProductsRangeAsync(IEnumerable<Product> products, CancellationToken cancellationToken);

        Task<ValidationResultDto> ValidateProductAsync(ProductCreateEditDto productData, CancellationToken cancellationToken);

        bool IsEditedProductValid(ProductCreateEditDto editedProductData, Product originalProduct, ValidationResultDto editedProductValidationResult);

        ValidationResultDto AllProductsFetched(IEnumerable<Product> fetchedProducts, IEnumerable<int> requestedIds);
    }
}
