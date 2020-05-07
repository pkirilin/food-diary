using System;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Infrastructure.Utils
{
    public class RuMealNameResolver : IMealNameResolver
    {
        public string GetMealName(MealType mealType)
        {
            switch (mealType)
            {
                case MealType.Breakfast:
                    return "Завтрак";
                case MealType.SecondBreakfast:
                    return "Ланч";
                case MealType.Lunch:
                    return "Обед";
                case MealType.AfternoonSnack:
                    return "Полдник";
                case MealType.Dinner:
                    return "Ужин";
                default:
                    throw new ArgumentException("Could not resolve meal name because unknown meal type specified", nameof(mealType));
            }
        }
    }
}
