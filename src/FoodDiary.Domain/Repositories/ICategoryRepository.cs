using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface ICategoryRepository
    {
        Task<IEnumerable<Category>> GetAllAsync(CancellationToken cancellationToken);

        Task<Category> GetByIdAsync(int id, CancellationToken cancellationToken);

        Task<bool> IsDuplicateAsync(string categoryName, CancellationToken cancellationToken);

        Category Create(Category category);

        Category Update(Category category);

        Category Delete(Category category);

        Task SaveChangesAsync(CancellationToken cancellationToken);
    }
}
