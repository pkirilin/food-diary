using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Pages;

public class PagesApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<PagesApiContext>(factory, infrastructure)
{
    protected override PagesApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    [Scenario]
    public Task I_can_retrieve_pages_list()
    {
        var pages = Create.PagesList(5)
            .StartingFrom("2024-01-01")
            .WithOneDayInterval()
            .Please();
        
        var expectedPages = pages[1..4];
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(pages),
            c => c.When_user_retieves_pages_list_from_to("2024-01-02", "2024-01-04"),
            c => c.Then_pages_list_contains_total_items_count(3),
            c => c.Then_pages_list_contains_items(expectedPages));
    }

    [Scenario]
    public Task I_can_retrieve_page_by_id()
    {
        var page = Create.Page("2024-01-01").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(page),
            c => c.When_user_retieves_page_by_id(page.Id),
            c => c.Then_page_by_id_contains_item(page));
    }

    [Scenario]
    public Task I_can_create_page()
    {
        var page = Create.Page("2024-01-02").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.When_user_creates_page(page),
            c => c.Then_page_is_successfully_created(),
            c => c.When_user_retieves_pages_list(),
            c => c.Then_pages_list_contains_items(page));
    }

    [Scenario]
    public Task I_can_update_page()
    {
        var page = Create.Page("2024-01-02").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(page),
            c => c.When_user_updates_page(page),
            c => c.Then_page_is_successfully_updated(),
            c => c.When_user_retieves_pages_list(),
            c => c.Then_pages_list_contains_items(page));
    }

    [Scenario]
    public Task I_can_delete_page()
    {
        var page = Create.Page("2024-01-02").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(page),
            c => c.When_user_deletes_page(page),
            c => c.Then_page_is_successfully_deleted(),
            c => c.When_user_retieves_pages_list(),
            c => c.Then_pages_list_is_empty());
    }
    
    [Scenario]
    public Task I_can_delete_many_pages()
    {
        var pages = Create.PagesList(3)
            .StartingFrom("2024-01-01")
            .WithOneDayInterval()
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(pages),
            c => c.When_user_deletes_multiple_pages(pages),
            c => c.Then_multiple_pages_are_successfully_deleted(),
            c => c.When_user_retieves_pages_list(),
            c => c.Then_pages_list_is_empty());
    }

    [Scenario]
    public Task I_receive_next_day_date_for_new_page_when_I_have_some_pages()
    {
        var pages = Create.PagesList(5)
            .StartingFrom("2024-01-01")
            .WithOneDayInterval()
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(pages),
            c => c.When_user_retieves_date_for_new_page(),
            c => c.Then_date_for_new_page_contains_value("2024-01-06"));
    }
    
    [Scenario]
    public Task I_receive_today_date_for_new_page_when_I_dont_have_any_pages()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.When_user_retieves_date_for_new_page(),
            c => c.Then_date_for_new_page_is_today());
    }
}