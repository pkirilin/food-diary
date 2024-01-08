using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Categories;

public class CategoriesApiTests : ScenarioBase<CategoriesApiContext>
{
    public CategoriesApiTests(FoodDiaryWebApplicationFactory factory) :
        base(factory, () => new CategoriesApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_categories_list()
    {
        var cereals = Create.Category("Cereals").Please();
        var dairy = Create.Category("Dairy").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(dairy, cereals),
            c => c.When_user_retrieves_categories_list(),
            c => c.Then_categories_list_contains_items(cereals, dairy));
    }

    [Scenario]
    public Task I_can_create_category()
    {
        var frozenFoods = Create.Category("Frozen foods").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.When_user_creates_category("Frozen foods"),
            c => c.Then_category_is_successfully_created(),
            c => c.When_user_retrieves_categories_list(),
            c => c.Then_categories_list_contains_items(frozenFoods));
    }

    [Scenario]
    public Task I_can_update_category()
    {
        var frozenFoods = Create.Category("Frozen foods").Please();
        var frozenProducts = Create.Category()
            .From(frozenFoods)
            .WithName("Frozen products")
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(frozenFoods),
            c => c.When_user_renames_category(frozenFoods, "Frozen products"),
            c => c.Then_category_is_successfully_updated(),
            c => c.When_user_retrieves_categories_list(),
            c => c.Then_categories_list_contains_items(frozenProducts));
    }

    [Scenario]
    public Task I_can_delete_category()
    {
        var frozenFoods = Create.Category("Frozen foods").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(frozenFoods),
            c => c.When_user_deletes_category(frozenFoods),
            c => c.Then_category_is_successfully_deleted(),
            c => c.When_user_retrieves_categories_list(),
            c => c.Then_categories_list_is_empty());
    }
    
    [Scenario]
    public Task I_can_search_categories_for_autocomplete()
    {
        var cereals = Create.Category("Cereals").Please();
        var dairy = Create.Category("Dairy").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(dairy, cereals),
            c => c.When_user_searches_categories_for_autocomplete(),
            c => c.Then_categories_list_for_autocomplete_contains_items(cereals, dairy));
    }
}