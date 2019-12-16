using System;
using FluentAssertions;
using FoodDiary.Domain.Services;
using FoodDiary.Infrastructure.Services;
using Xunit;

namespace FoodDiary.UnitTests.Services
{
    public class CaloriesServiceTests
    {
        public CaloriesServiceTests()
        {
        }

        public ICaloriesService CaloriesService => new CaloriesService();

        [Theory]
        [InlineData(1, 1)]
        [InlineData(100, 100)]
        [InlineData(150, 100)]
        [InlineData(280, 120)]
        public void CalculateForQuantity_ReturnsCorrectValue_WhenValidParametersSpecified(double caloriesCost, double quantity)
        {
            var result = CaloriesService.CalculateForQuantity(caloriesCost, quantity);

            result.Should().Be(caloriesCost * quantity / 100);
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(100, -100)]
        [InlineData(-100, 100)]
        [InlineData(-100, -100)]
        public void CalculateForQuantity_ThrowsException_WhenInvalidParametersSpecified(double caloriesCost, double quantity)
        {
            var service = CaloriesService;

            service.Invoking(a => a.CalculateForQuantity(caloriesCost, quantity))
                .Should()
                .Throw<ArgumentException>();
        }
    }
}
