using System.Linq;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Infrastructure.Repositories;

public class NoteRepository : Repository<Note>, INoteRepository
{
    public NoteRepository(FoodDiaryContext context) : base(context)
    {
    }

    public IQueryable<Note> LoadProduct(IQueryable<Note> query)
    {
        return query.Include(n => n.Product);
    }
}