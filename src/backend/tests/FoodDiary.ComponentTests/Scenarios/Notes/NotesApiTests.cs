using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiTests : ScenarioBase<NotesApiContext>
{
    public NotesApiTests(FoodDiaryWebApplicationFactory factory) : base(factory, () => new NotesApiContext(factory))
    {
    }

    [Scenario]
    public Task I_can_retrieve_notes_list()
    {
        var page = Create.Page("2024-01-01")
            .WithId(1)
            .Please();
        
        var categories = new
        {
            Meat = Create.Category("Meat").Please(),
            Cereals = Create.Category("Cereals").Please()
        };
        
        var products = new
        {
            Chicken = Create.Product("Chicken")
                .WithCategory(categories.Meat)
                .Please(),
            Rice = Create.Product("Rice")
                .WithCategory(categories.Cereals)
                .Please()
        };
        
        var notes = new
        {
            LunchChicken = Create.Note(MealType.Lunch)
                .WithPage(page)
                .WithProduct(products.Chicken, 150)
                .WithDisplayOrder(0)
                .Please(),
            LunchRice = Create.Note(MealType.Lunch)
                .WithPage(page)
                .WithProduct(products.Rice, 100)
                .WithDisplayOrder(1)
                .Please(),
        };
        
        return Run(
            c => c.Given_authenticated_user(),
            c => c.Given_notes(notes.LunchChicken, notes.LunchRice),
            c => c.When_user_retrieves_notes_list_for_page(page),
            c => c.Then_notes_list_contains_items(notes.LunchChicken, notes.LunchRice));
    }
}