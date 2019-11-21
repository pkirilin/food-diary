using System;
using AutoMapper;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Helpers
{
    public class MealTypeToStringConverter : ITypeConverter<MealType, string>
    {
        public string Convert(MealType source, string destination, ResolutionContext context)
        {
            return source switch
            {
                MealType.Breakfast => "Breakfast",
                MealType.SecondBreakfast => "Second breakfast",
                MealType.Lunch => "Lunch",
                MealType.AfternoonSnack => "Afternoon snack",
                MealType.Dinner => "Dinner",
                _ => throw new ArgumentException("${nameof(MealTypeConverter)} does not contain mapping rules for source value = '{(int)source}'", nameof(source)),
            };
        }
    }
}
