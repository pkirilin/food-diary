using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Utils
{
    public interface IMealNameResolver
    {
        string GetMealName(MealType mealType);
    }
}
