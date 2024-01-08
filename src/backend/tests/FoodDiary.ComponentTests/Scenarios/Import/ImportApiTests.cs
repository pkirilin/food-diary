using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Scenarios.Import;

public class ImportApiTests : ScenarioBase<ImportApiContext>
{
    public ImportApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new ImportApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_import_my_data_from_json_file()
    {
        var page = Create.Page("2020-08-08").Please();
        var emptyPage = Create.Page("2020-08-09").Please();

        var categories = new
        {
            Cereals = Create.Category("Cereals").Please(),
            Dairy = Create.Category("Dairy").Please()
        };

        var products = new
        {
            Oats = Create.Product("Oats")
                .WithCategory(categories.Cereals)
                .WithCaloriesCost(378)
                .WithDefaultQuantity(80)
                .Please(),
            Milk = Create.Product("Milk")
                .WithCategory(categories.Dairy)
                .WithCaloriesCost(60)
                .WithDefaultQuantity(150)
                .Please(),
        };
        
        var notes = new
        {
            Oats = Create.Note()
                .WithMealType(MealType.Breakfast)
                .WithPage(page)
                .WithProduct(products.Oats, 80)
                .WithDisplayOrder(0)
                .Please(),
            Milk = Create.Note()
                .WithMealType(MealType.Breakfast)
                .WithPage(page)
                .WithProduct(products.Milk, 100)
                .WithDisplayOrder(1)
                .Please()
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(page),
            c => c.Given_categories(categories.Cereals),
            c => c.Given_products(products.Oats),
            c => c.Given_notes(notes.Oats),
            c => c.When_user_imports_data_from_json_file("testImportFile.json"),
            c => c.Then_json_import_is_successful(),
            c => c.Then_pages_list_contains_items(page, emptyPage),
            c => c.Then_notes_list_contains_items(notes.Oats, notes.Milk),
            c => c.Then_products_list_contains_items(products.Oats, products.Milk),
            c => c.Then_categories_list_contains_items(categories.Cereals, categories.Dairy));
    }
}