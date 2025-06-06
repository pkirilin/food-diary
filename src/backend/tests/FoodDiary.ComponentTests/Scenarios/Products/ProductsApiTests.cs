using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Products;

public class ProductsApiTests(InfrastructureFixture infrastructure)
    : BaseTest<ProductsApiContext>(infrastructure)
{
    [Scenario]
    public Task I_can_retrieve_products_list()
    {
        var apple = Create.Product("Apple").Please();
        var chicken = Create.Product("Chicken").Please();
        var milk = Create.Product("Milk").Please();
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_products(chicken, apple, milk),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_contains_items(chicken, apple, milk));
    }
    
    [Scenario]
    public Task I_can_get_product_by_id()
    {
        var apple = Create.Product("Apple").Please();
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_products(apple),
            c => c.When_user_retrieves_product_by_id(apple.Id),
            c => c.Then_product_is_successfully_retrieved(apple));
    }

    [Scenario]
    public Task I_can_search_products_by_name()
    {
        var apple = Create.Product("Apple").Please();
        var mozzarellaCheese = Create.Product("Mozzarella cheese").Please();
        var milk = Create.Product("Milk").Please();
        var chicken = Create.Product("Chicken").Please();
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_products(apple, mozzarellaCheese, milk, chicken),
            c => c.When_user_searches_products_by_name("ch"),
            c => c.Then_products_list_contains_items(chicken, mozzarellaCheese));
    }

    [Scenario]
    public Task I_can_search_products_for_autocomplete()
    {
        return CtxRunner.RunScenarioAsync(
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
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_categories(chicken.Category),
            c => c.When_user_creates_product(chicken),
            c => c.Then_product_is_successfully_created(),
            c => c.When_user_retrieves_created_product_by_id(),
            c => c.Then_product_is_successfully_retrieved(chicken));
    }

    [Scenario]
    public Task I_can_update_product()
    {
        var chicken = Create.Product("Chicken").Please();
        var boiledChicken = Create.Product().From(chicken).WithName("Boiled chicken").Please();
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_products(chicken),
            c => c.When_user_renames_product(chicken, "Boiled chicken"),
            c => c.Then_product_is_successfully_updated(),
            c => c.When_user_retrieves_product_by_id(boiledChicken.Id),
            c => c.Then_product_is_successfully_retrieved(boiledChicken));
    }

    [Scenario]
    public Task I_can_delete_product()
    {
        var milk = Create.Product("Milk").Please();
        
        return CtxRunner.RunScenarioAsync(
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
        
        return CtxRunner.RunScenarioAsync(
            c => c.Given_authenticated_user(),
            c => c.Given_products(milk),
            c => c.When_user_deletes_products(oats, milk),
            c => c.Then_multiple_products_are_successfully_deleted(),
            c => c.When_user_retrieves_products_list(),
            c => c.Then_products_list_is_empty());
    }
}