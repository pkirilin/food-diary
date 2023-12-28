using FoodDiary.ComponentTests.Dsl;
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
            c => c.Given_notes(Given.Notes.August202008.ChickenWithRiceForLunch),
            c => c.When_user_retrieves_notes_list_for_page(Given.Page.August202008),
            c => c.Then_notes_list_contains_items(Given.Notes.August202008.ChickenWithRiceForLunch));
    }
}