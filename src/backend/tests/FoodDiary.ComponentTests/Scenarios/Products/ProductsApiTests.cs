using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests : ScenarioBase<ProductsApiContext>
{
    public ProductsApiTests(FoodDiaryWebApplicationFactory factory) : base(() => new ProductsApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_empty_products_list()
    {
        return Run(
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_is_empty());
    }
}