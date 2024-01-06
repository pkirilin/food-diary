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