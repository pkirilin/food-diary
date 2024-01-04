using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public static class Given
{
    public static class Page
    {
        public static readonly Domain.Entities.Page August202008 = Create.Page("2020-08-08").WithId(1).Please();
        public static Domain.Entities.Page January202404() => Create.Page("2024-01-04").WithId(2).Please();
    }

    public static class Category
    {
        public static readonly Domain.Entities.Category Cereals = Create.Category("Cereals").Please();
        public static readonly Domain.Entities.Category Dairy = Create.Category("Dairy").Please();
        public static readonly Domain.Entities.Category Meat = Create.Category("Meat").Please();
    }

    public static class Product
    {
        public static readonly Domain.Entities.Product Oats = Create.Product("Oats")
            .WithId(1)
            .WithCategory(Category.Cereals)
            .WithCaloriesCost(378)
            .WithDefaultQuantity(80)
            .Please();

        public static readonly Domain.Entities.Product Milk = Create.Product("Milk")
            .WithId(2)
            .WithCategory(Category.Dairy)
            .WithCaloriesCost(60)
            .WithDefaultQuantity(150)
            .Please();

        public static readonly Domain.Entities.Product Chicken = Create.Product("Chicken")
            .WithId(3)
            .WithCategory(Category.Meat)
            .WithCaloriesCost(150)
            .WithDefaultQuantity(150)
            .Please();

        public static readonly Domain.Entities.Product Rice = Create.Product("Rice")
            .WithId(4)
            .WithCategory(Category.Cereals)
            .WithCaloriesCost(110)
            .WithDefaultQuantity(90)
            .Please();
        
        public static Domain.Entities.Product Beef() => Create.Product("Beef")
            .WithId(5)
            .WithCategory(Category.Meat)
            .WithCaloriesCost(300)
            .WithDefaultQuantity(100)
            .Please();
    }

    public static class Notes
    {
        public static class August202008
        {
            public static readonly Note[] OatsWithMilkForBreakfast =
            {
                Create.Note(MealType.Breakfast)
                    .WithPage(Page.August202008)
                    .WithProduct(Product.Oats, 80)
                    .WithDisplayOrder(0)
                    .Please(),
                Create.Note(MealType.Breakfast)
                    .WithPage(Page.August202008)
                    .WithProduct(Product.Milk, 100)
                    .WithDisplayOrder(1)
                    .Please()
            };

            public static readonly Note[] ChickenWithRiceForLunch =
            {
                Create.Note(MealType.Lunch)
                    .WithPage(Page.August202008)
                    .WithProduct(Product.Chicken, 170)
                    .WithDisplayOrder(0)
                    .Please(),
                Create.Note(MealType.Lunch)
                    .WithPage(Page.August202008)
                    .WithProduct(Product.Rice, 100)
                    .WithDisplayOrder(1)
                    .Please()
            };
        }

        public static class January202404
        {
            public static class Breakfast
            {
                public static Note Beef() => Create.Note(MealType.Breakfast)
                    .WithPage(Page.January202404())
                    .WithProduct(Product.Beef(), 200)
                    .WithDisplayOrder(0)
                    .Please();
            }
        }
    }
}