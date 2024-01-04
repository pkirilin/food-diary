using System.Diagnostics.CodeAnalysis;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public static class Given
{
    public static class Page
    {
        public static Domain.Entities.Page August_08_2020 => Create.Page("2020-08-08").WithId(1).Please();
    }

    public static class Category
    {
        public static Domain.Entities.Category Cereals => Create.Category("Cereals").Please();
        public static Domain.Entities.Category Dairy => Create.Category("Dairy").Please();
        public static Domain.Entities.Category Meat => Create.Category("Meat").Please();
    }

    public static class Product
    {
        private static readonly Domain.Entities.Category SharedCereals = Category.Cereals;
        
        public static Domain.Entities.Product Oats => Create.Product("Oats")
            .WithId(1)
            .WithCategory(SharedCereals)
            .WithCaloriesCost(378)
            .WithDefaultQuantity(80)
            .Please();

        public static Domain.Entities.Product Milk => Create.Product("Milk")
            .WithId(2)
            .WithCategory(Category.Dairy)
            .WithCaloriesCost(60)
            .WithDefaultQuantity(150)
            .Please();

        public static Domain.Entities.Product Chicken => Create.Product("Chicken")
            .WithId(3)
            .WithCategory(Category.Meat)
            .WithCaloriesCost(150)
            .WithDefaultQuantity(150)
            .Please();

        public static Domain.Entities.Product Rice => Create.Product("Rice")
            .WithId(4)
            .WithCategory(SharedCereals)
            .WithCaloriesCost(110)
            .WithDefaultQuantity(90)
            .Please();
    }

    public static class Notes
    {
        public static class August_08_2020
        {
            private static readonly Domain.Entities.Page SharedPage = Page.August_08_2020;
            
            public static class Breakfast
            {
                public static Note Oats => Create.Note()
                    .WithMealType(MealType.Breakfast)
                    .WithPage(SharedPage)
                    .WithProduct(Product.Oats, 80)
                    .WithDisplayOrder(0)
                    .Please();
                
                public static Note Milk => Create.Note()
                    .WithMealType(MealType.Breakfast)
                    .WithPage(SharedPage)
                    .WithProduct(Product.Milk, 100)
                    .WithDisplayOrder(1)
                    .Please();
            }
            
            public static class Lunch
            {
                public static Note Chicken => Create.Note()
                    .WithMealType(MealType.Lunch)
                    .WithPage(SharedPage)
                    .WithProduct(Product.Chicken, 170)
                    .WithDisplayOrder(0)
                    .Please();

                public static Note Rice => Create.Note()
                    .WithMealType(MealType.Lunch)
                    .WithPage(SharedPage)
                    .WithProduct(Product.Rice, 100)
                    .WithDisplayOrder(1)
                    .Please();
            }
        }
    }
}