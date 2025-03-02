using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<ProductsApiContext>(factory, infrastructure)
{
    protected override ProductsApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    [Scenario]
    public Task I_can_retrieve_products_list()
    {
        var apple = Create.Product("Apple").Please();
        var chicken = Create.Product("Chicken").Please();
        var milk = Create.Product("Milk").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products(chicken, apple, milk),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_items(chicken, apple, milk));
    }

    [Scenario]
    public Task I_can_search_products_by_name()
    {
        var apple = Create.Product("Apple").Please();
        var mozzarellaCheese = Create.Product("Mozzarella cheese").Please();
        var milk = Create.Product("Milk").Please();
        var chicken = Create.Product("Chicken").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products(apple, mozzarellaCheese, milk, chicken),
            c => c.When_user_searches_products_by_name("ch"),
            c => c.Then_products_list_contains_items(chicken, mozzarellaCheese));
    }

    [Scenario]
    public Task I_can_search_products_for_autocomplete()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_product("Chicken"),
            c => c.Given_product_logged_yesterday("Beef"),
            c => c.Given_product_logged_yesterday("Apple"),
            c => c.Given_product_logged_today("Eggs"),
            c => c.Given_product_logged_today("Apple"),
            c => c.When_user_searches_products_for_autocomplete(),
            c => c.Then_products_list_for_autocomplete_contains_items("Apple", "Eggs", "Beef", "Chicken"));
    }

    [Scenario]
    public Task I_can_create_product()
    {
        var chicken = Create.Product("Chicken").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(chicken.Category),
            c => c.When_user_creates_product(chicken),
            c => c.Then_product_is_successfully_created(),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_items(chicken));
    }

    [Scenario]
    public Task I_can_update_product()
    {
        var chicken = Create.Product("Chicken").Please();
        var boiledChicken = Create.Product().From(chicken).WithName("Boiled chicken").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products(chicken),
            c => c.When_user_renames_product(chicken, "Boiled chicken"),
            c => c.Then_product_is_successfully_updated(),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_items(boiledChicken));
    }

    [Scenario]
    public Task I_can_delete_product()
    {
        var milk = Create.Product("Milk").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products(milk),
            c => c.When_user_deletes_product(milk),
            c => c.Then_product_is_successfully_deleted(),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_is_empty());
    }
    
    [Scenario]
    public Task I_can_delete_multiple_products()
    {
        var oats = Create.Product("Oats").Please();
        var milk = Create.Product("Milk").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_products(milk),
            c => c.When_user_deletes_products(oats, milk),
            c => c.Then_multiple_products_are_successfully_deleted(),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_is_empty());
    }
}