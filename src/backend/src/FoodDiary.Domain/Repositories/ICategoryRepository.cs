using System.Linq;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface ICategoryRepository : IRepository<Category>, ILookupRepository<string, Category>
    {
        IQueryable<Category> LoadProducts(IQueryable<Category> query); 
    }
}
