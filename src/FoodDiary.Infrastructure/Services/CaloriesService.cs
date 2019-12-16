using System;
using FoodDiary.Domain.Services;

namespace FoodDiary.Infrastructure.Services
{
    public class CaloriesService : ICaloriesService
    {
        public CaloriesService()
        {
        }

        public double CalculateForQuantity(double caloriesCost, double quantity)
        {
            if (caloriesCost < 1)
                throw new ArgumentException("Calories cost value must be a positive number", nameof(caloriesCost));
            if (quantity < 1)
                throw new ArgumentException("Quantity value must be a positive number", nameof(quantity));

            return caloriesCost * quantity / 100;
        }
    }
}
