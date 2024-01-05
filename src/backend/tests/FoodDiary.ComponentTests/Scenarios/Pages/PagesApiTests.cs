using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Pages;

public class PagesApiTests : ScenarioBase<PagesApiContext>
{
    public PagesApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new PagesApiContext(factory))
    {
    }

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
    public Task I_can_get_date_for_new_page()
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
}