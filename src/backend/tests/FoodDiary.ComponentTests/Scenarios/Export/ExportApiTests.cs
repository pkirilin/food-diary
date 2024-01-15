using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Scenarios.Export;

public class ExportApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<ExportApiContext>(factory, infrastructure)
{
    protected override ExportApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    [Scenario]
    public Task I_can_export_data_to_json_file()
    {
        var pages = Create.Page("2024-01-01")
            .WithNotes(MealType.Breakfast, count: 2)
            .WithNotes(MealType.Lunch, count: 2)
            .WithNotes(MealType.Dinner, count: 2)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(pages),
            c => c.When_user_exports_data_to_json_file("2024-01-01", "2024-01-03"),
            c => c.Then_json_export_is_successful(),
            c => c.Then_json_file_contains_pages(pages));
    }

    [Scenario]
    public Task I_can_export_data_to_google_document_on_my_google_drive()
    {
        var pages = Create.Page("2024-01-01")
            .WithNotes(MealType.Breakfast, count: 2)
            .WithNotes(MealType.Lunch, count: 2)
            .WithNotes(MealType.Dinner, count: 2)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_pages(pages),
            c => c.When_user_exports_data_to_google_document("2024-01-01", "2024-01-03"),
            c => c.Then_google_docs_export_is_successful());
    }
}