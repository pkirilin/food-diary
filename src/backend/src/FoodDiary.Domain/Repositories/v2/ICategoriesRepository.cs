using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories.v2;

public interface ICategoriesRepository
{
    Task<Category[]> GetAllOrderedByNameAsync(CancellationToken cancellationToken);
}