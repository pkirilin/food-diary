using System.Threading;
using System.Threading.Tasks;

namespace FoodDiary.Domain.Abstractions
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
