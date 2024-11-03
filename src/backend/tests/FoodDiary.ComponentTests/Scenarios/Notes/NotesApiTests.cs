using System.Net;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiTests(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : ScenarioBase<NotesApiContext>(factory, infrastructure)
{
    protected override NotesApiContext CreateContext(
        FoodDiaryWebApplicationFactory factory,
        InfrastructureFixture infrastructure) => new(factory, infrastructure);

    private static NoteBuilder Breakfast() => Create.Note()
        .WithDate("2024-01-04")
        .WithMealType(MealType.Breakfast);
    
    private static NoteBuilder Lunch() => Create.Note()
        .WithDate("2024-01-04")
        .WithMealType(MealType.Lunch);

    [Scenario]
    public Task I_can_retrieve_notes_list()
    {
        var notes = new
        {
            Chicken = Breakfast().WithProduct("Chicken", 150).WithDisplayOrder(0).Please(),
            Rice = Breakfast().WithProduct("Rice", 100).WithDisplayOrder(1).Please(),
            Cheese = Lunch().WithProduct("Cheese", 350).WithDisplayOrder(0).Please(),
            Bread = Lunch().WithProduct("Bread", 250).WithDisplayOrder(1).Please(),
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(notes.Rice, notes.Bread, notes.Chicken, notes.Cheese),
            c => c.When_user_retrieves_notes_list_for_date("2024-01-04"),
            c => c.Then_notes_list_contains_items(notes.Chicken, notes.Rice, notes.Cheese, notes.Bread));
    }
    
    [Scenario]
    public Task I_can_retrieve_notes_history_list()
    {
        var notes = new
        {
            Chicken = Create.Note().WithDate("2024-01-04").WithProduct("Chicken", 150).Please(),
            Rice = Create.Note().WithDate("2024-01-04").WithProduct("Rice", 100).Please(),
            Broccoli = Create.Note().WithDate("2024-01-05").WithProduct("Broccoli", 50).Please()
        };

        var history = new
        {
            Jan04 = Create.NoteHistoryItem("2024-01-04", 250),
            Jan05 = Create.NoteHistoryItem("2024-01-05", 50)
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(notes.Chicken, notes.Broccoli, notes.Rice),
            c => c.When_user_retrieves_notes_history("2024-01-01", "2024-01-31"),
            c => c.Then_notes_history_contains_items(history.Jan04, history.Jan05));
    }

    [Scenario]
    public Task I_can_create_note()
    {
        var product = Create.Product("Chicken").Please();
        var note = Create.Note()
            .WithDate("2024-01-04")
            .WithProduct(product, 150)
            .Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_product(product),
            c => c.When_user_creates_note(note),
            c => c.Then_note_is_successfully_created(),
            c => c.When_user_retrieves_notes_list_for_date("2024-01-04"),
            c => c.Then_notes_list_contains_items(note));
    }
    
    [Scenario]
    public Task I_can_update_note()
    {
        var newProduct = Create.Product("Beef").Please();
        
        var originalNote = Create.Note()
            .WithDate("2024-01-04")
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
            c => c.When_user_retrieves_notes_list_for_date("2024-01-04"),
            c => c.Then_notes_list_contains_items(updatedNote));
    }

    [Scenario]
    public Task I_can_delete_single_note()
    {
        var note = Create.Note().WithDate("2024-01-04").Please();
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(note),
            c => c.When_user_deletes_note(note),
            c => c.Then_note_is_successfully_deleted(),
            c => c.When_user_retrieves_notes_list_for_date("2024-01-04"),
            c => c.Then_notes_list_contains_no_items());
    }

    [Scenario]
    public Task I_can_recognize_notes_by_photo()
    {
        var orangeNote = Create.RecognizeNoteItem()
            .WithProduct("Orange", caloriesCost: 50)
            .WithQuantity(400)
            .Please();
        
        return Run(
            c => c.Given_OpenAI_api_is_ready(),
            c => c.Given_OpenAI_api_can_recognize_notes(orangeNote),
            c => c.Given_authenticated_user(),
            c => c.When_user_uploads_file_for_note_recognition("recognizeNoteSamplePhoto.png"),
            c => c.Then_note_is_successfully_recognized_as(orangeNote));
    }
    
    [Scenario]
    public Task I_cannot_recognize_notes_when_OpenAI_model_response_is_invalid()
    {
        return Run(
            c => c.Given_OpenAI_api_is_ready(),
            c => c.Given_OpenAI_completion_response_is_not_recognized_notes_json(),
            c => c.Given_authenticated_user(),
            c => c.When_user_uploads_file_for_note_recognition("recognizeNoteSamplePhoto.png"),
            c => c.Then_recognize_note_response_returns_error(HttpStatusCode.InternalServerError));
    }
    
    [Scenario]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.PaymentRequired)]
    [InlineData(HttpStatusCode.Forbidden)]
    public Task I_cannot_recognize_notes_when_OpenAI_request_fails(HttpStatusCode statusCode)
    {
        return Run(
            c => c.Given_OpenAI_api_is_ready(),
            c => c.Given_OpenAI_request_failed_with_error(statusCode),
            c => c.Given_authenticated_user(),
            c => c.When_user_uploads_file_for_note_recognition("recognizeNoteSamplePhoto.png"),
            c => c.Then_recognize_note_response_returns_error(HttpStatusCode.InternalServerError));
    }
}