using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Domain.Abstractions.v2;

public interface IFoodDiaryUnitOfWork
{
    IProductsRepository Products { get; }
    
    ICategoriesRepository Categories { get; }
    
    Task SaveChangesAsync(CancellationToken cancellationToken);
}