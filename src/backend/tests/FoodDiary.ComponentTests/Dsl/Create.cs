using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public static class Create
{
    public static CategoryBuilder Category(string name) => new(name);
    public static PageBuilder Page(string date) => new(date);
    public static ProductBuilder Product(string name) => new(name);
    public static NoteBuilder Note(MealType mealType) => new(mealType);
}