using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests : ScenarioBase<ProductsApiContext>
{
    public ProductsApiTests(FoodDiaryWebApplicationFactory factory) : base(() => new ProductsApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_products_list()
    {
        return Run(
            c => c.Given_user_is_authenticated(),
            c => c.Given_products("Chicken", "Apple", "Milk"),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_products_ordered_by_name("Chicken", "Apple", "Milk"));
    }
}