using FluentAssertions;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using Xunit;

namespace FoodDiary.UnitTests.Utils
{
    public class RuMealNameResolverTests
    {
        private static IMealNameResolver Sut => new RuMealNameResolver();
        
        [Theory]
        [InlineData(MealType.Breakfast, "Завтрак")]
        [InlineData(MealType.SecondBreakfast, "Ланч")]
        [InlineData(MealType.Lunch, "Обед")]
        [InlineData(MealType.AfternoonSnack, "Полдник")]
        [InlineData(MealType.Dinner, "Ужин")]
        public void ShouldReturnMealNameByMealType(MealType mealType, string mealNameResult)
        {
            Sut.GetMealName(mealType).Should().Be(mealNameResult);
        }
    }
}
