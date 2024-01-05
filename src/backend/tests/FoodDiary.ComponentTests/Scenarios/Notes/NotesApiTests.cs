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
        var page = Create.Page("2024-01-04").Please();
        
        var notes = new
        {
            Chicken = Create.Note().WithPage(page).WithProduct("Chicken", 150).Please(),
            Rice = Create.Note().WithPage(page).WithProduct("Rice", 100).Please()
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(notes.Chicken, notes.Rice),
            c => c.When_user_retrieves_notes_list_for_page(page),
            c => c.Then_notes_list_contains_items(notes.Chicken, notes.Rice));
    }

    [Scenario]
    public Task I_can_create_note()
    {
        var page = Create.Page("2024-01-04").Please();
        var product = Create.Product("Chicken").Please();
        var note = Create.Note()
            .WithPage(page)
            .WithProduct(product, 150)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_page(page),
            c => c.Given_product(product),
            c => c.When_user_creates_note(note),
            c => c.Then_note_is_successfully_created(),
            c => c.When_user_retrieves_notes_list_for_page(page),
            c => c.Then_notes_list_contains_items(note));
    }
    
    [Scenario]
    public Task I_can_update_note()
    {
        var newProduct = Create.Product("Beef").Please();
        
        var originalNote = Create.Note()
            .WithProduct("Chicken", 150)
            .Please();
        
        var updatedNote = Create.Note()
            .From(originalNote)
            .WithProduct(newProduct, 200)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(originalNote),
            c => c.Given_product(newProduct),
            c => c.When_user_updates_product_with_quantity_for_note(originalNote, newProduct, 200),
            c => c.Then_note_is_successfully_updated(),
            c => c.When_user_retrieves_notes_list_for_page(originalNote.Page),
            c => c.Then_notes_list_contains_items(updatedNote));
    }

    [Scenario]
    public Task I_can_delete_single_note()
    {
        var page = Create.Page("2024-01-04").Please();
        var note = Create.Note().WithPage(page).Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(note),
            c => c.When_user_deletes_note(note),
            c => c.Then_note_is_successfully_deleted(),
            c => c.When_user_retrieves_notes_list_for_page(page),
            c => c.Then_notes_list_contains_no_items());
    }
}