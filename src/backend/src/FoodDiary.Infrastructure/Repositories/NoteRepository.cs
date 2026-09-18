using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Infrastructure.Repositories;

public class NoteRepository(FoodDiaryContext context) : Repository<Note>(context), INoteRepository;