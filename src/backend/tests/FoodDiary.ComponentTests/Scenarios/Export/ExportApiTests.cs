using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Export;

public class ExportApiTests : ScenarioBase<ExportApiContext>
{
    public ExportApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new ExportApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_export_data_to_json_file()
    {
        var page = Create.Page("2024-01-01").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(page),
            c => c.When_user_exports_data_to_json_file("2024-01-01", "2024-01-03"),
            c => c.Then_json_export_is_successful(),
            c => c.Then_json_file_contains_pages(page));
    }
}