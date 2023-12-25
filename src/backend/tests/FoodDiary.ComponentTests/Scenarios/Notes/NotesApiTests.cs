using FoodDiary.ComponentTests.Infrastructure;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiTests : ScenarioBase<NotesApiContext>
{
    public NotesApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new NotesApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_notes_list()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes("Breakfast, Chicken, 150", "Breakfast, Rice, 100"),
            c => c.When_user_retrieves_notes_list(),
            c => c.Then_notes_list_contains("Breakfast, Chicken, 150", "Breakfast, Rice, 100"));
    }
}