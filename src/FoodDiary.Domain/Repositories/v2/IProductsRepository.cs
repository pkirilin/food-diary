using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories.v2;

public interface IProductsRepository
{
    Task<Product[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken);
}