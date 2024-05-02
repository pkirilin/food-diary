using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

#nullable enable

namespace FoodDiary.Domain.Repositories.v2;

public interface IProductsRepository
{
    Task<Product[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken);
    
    Task<Product?> FindByExactName(string name, CancellationToken cancellationToken);

    Task Create(Product product, CancellationToken cancellationToken);
}