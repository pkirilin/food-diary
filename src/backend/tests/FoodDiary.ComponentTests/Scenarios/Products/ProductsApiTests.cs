using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests : ScenarioBase<ProductsApiContext>
{
    public ProductsApiTests(FoodDiaryWebApplicationFactory factory)
        : base(factory, () => new ProductsApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_products_list()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products("Chicken", "Apple", "Milk"),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_products_ordered_by_name("Chicken", "Apple", "Milk"));
    }

    [Scenario]
    public Task I_can_search_products_for_autocomplete()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products("Chicken", "Apple", "Milk"),
            c => c.When_user_searches_products_for_autocomplete(),
            c => c.Then_products_for_autocomplete_contain_products_ordered_by_name("Chicken", "Apple", "Milk"));
    }
}