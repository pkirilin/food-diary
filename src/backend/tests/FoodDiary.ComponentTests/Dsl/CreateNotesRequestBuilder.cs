using FoodDiary.ComponentTests.Infrastructure.DateAndTime;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.ComponentTests.Dsl;

public class CreateNotesRequestBuilder
{
    private DateOnly _date = FakeDateTimeProvider.Today();
    private MealType _mealType = MealType.Breakfast;
    private List<CreateNotesRequest.Note> _notes = [];

    public CreateNotesRequest Please() => new()
    {
        Date = _date,
        MealType = _mealType,
        Notes = _notes
    };

    public CreateNotesRequestBuilder From(IReadOnlyList<Note> notes)
    {
        _date = notes[0].Date;
        _mealType = notes[0].MealType;
        _notes = notes
            .Select(n => new CreateNotesRequest.Note
            {
                ProductId = n.Product!.Id,
                ProductQuantity = n.ProductQuantity
            })
            .ToList();
        return this;
    }
}
