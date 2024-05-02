using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Domain.Abstractions.v2;

public interface IFoodDiaryUnitOfWork
{
    ICategoriesRepository Categories { get; }
}