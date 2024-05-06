using FoodDiary.Domain.Abstractions.v2;
using FoodDiary.Domain.Repositories.v2;
using FoodDiary.Infrastructure.Repositories.v2;

namespace FoodDiary.Infrastructure;

public class FoodDiaryUnitOfWork(FoodDiaryContext context) : IFoodDiaryUnitOfWork
{
    public ICategoriesRepository Categories => new CategoriesRepository(context.Categories);
}