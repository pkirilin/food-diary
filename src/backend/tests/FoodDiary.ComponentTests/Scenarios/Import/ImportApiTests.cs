using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Import;

public class ImportApiTests : ScenarioBase<ImportApiContext>
{
    public ImportApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new ImportApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_import_my_data_from_json_file()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_json_import_file_name("testImportFile.json"),
            c => c.When_user_imports_data_from_json_file(),
            c => c.Then_json_import_is_successful(),
            c => c.Then_pages_list_contains_item(Given.Page.August_08_2020),
            c => c.Then_notes_list_contains_items(
                Given.Notes.August_08_2020.Breakfast.Oats,
                Given.Notes.August_08_2020.Breakfast.Milk),
            c => c.Then_products_list_contains_items(Given.Product.Oats, Given.Product.Milk),
            c => c.Then_categories_list_contains_items(Given.Category.Cereals, Given.Category.Dairy));
    }
}