namespace FoodDiary.Domain.Services
{
    public interface ICaloriesService
    {
        double CalculateForQuantity(double caloriesCost, double quantity);
    }
}
