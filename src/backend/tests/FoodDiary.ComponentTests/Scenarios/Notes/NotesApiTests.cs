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
            c => c.Given_notes(
                Given.Notes.August_08_2020.Lunch.Chicken,
                Given.Notes.August_08_2020.Lunch.Rice),
            c => c.When_user_retrieves_notes_list_for_page(Given.Page.August_08_2020),
            c => c.Then_notes_list_contains_items(
                Given.Notes.August_08_2020.Lunch.Chicken,
                Given.Notes.August_08_2020.Lunch.Rice));
    }

    [Scenario]
    public Task I_can_create_note()
    {
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_page(Given.Page.August_08_2020),
            c => c.Given_product(Given.Product.Chicken),
            c => c.When_user_creates_note(Given.Notes.August_08_2020.Lunch.Chicken),
            c => c.Then_note_is_successfully_created(),
            c => c.When_user_retrieves_notes_list_for_page(Given.Page.August_08_2020),
            c => c.Then_notes_list_contains_items(Given.Notes.August_08_2020.Lunch.Chicken));
    }
    
    [Scenario]
    public Task I_can_update_note()
    {
        var originalNote = Given.Notes.August_08_2020.Lunch.Chicken;
        // TODO: remove this hack
        originalNote.Page.Notes.Clear();
        var expectedNote = Create.Note()
            .From(originalNote)
            .WithProductQuantity(200)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(originalNote),
            c => c.When_user_updates_product_quantity_for_note_to_quantity(originalNote, 200),
            c => c.Then_note_is_successfully_updated(),
            c => c.When_user_retrieves_notes_list_for_page(Given.Page.August_08_2020),
            c => c.Then_notes_list_contains_items(expectedNote));
    }
}