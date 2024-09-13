using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Infrastructure.Repositories;

public class NoteRepository : Repository<Note>, INoteRepository
{
    public NoteRepository(FoodDiaryContext context) : base(context)
    {
    }
}