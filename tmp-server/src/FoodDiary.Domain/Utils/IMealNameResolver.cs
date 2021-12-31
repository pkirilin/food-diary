using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Utils
{
    public interface IMealNameResolver
    {
        /// <summary>
        /// Gets string representation of specified meal type
        /// </summary>
        string GetMealName(MealType mealType);
    }
}
