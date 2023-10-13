using System.Linq;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Repositories
{
    public interface INoteRepository : IRepository<Note>
    {
        IQueryable<Note> LoadProduct(IQueryable<Note> query);
    }
}
