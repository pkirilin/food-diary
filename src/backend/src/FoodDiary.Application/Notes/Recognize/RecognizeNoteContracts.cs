using System.Collections.Generic;
using JetBrains.Annotations;

namespace FoodDiary.Application.Notes.Recognize;

[PublicAPI]
public record RecognizeNoteResponse(IReadOnlyList<RecognizeNoteItem> Notes);

[PublicAPI]
public record RecognizeNoteItem(RecognizeProductItem Product, int Quantity);

[PublicAPI]
public record RecognizeProductItem(string Name, int CaloriesCost);

public static class MappingExtensions
{
    public static RecognizeNoteItem ToRecognizeNoteItem(this FoodItemOnTheImage food)
    {
        return new RecognizeNoteItem(
            Product: new RecognizeProductItem(
                Name: string.IsNullOrWhiteSpace(food.BrandName) ? food.Name : $"{food.Name} ({food.BrandName})",
                CaloriesCost: food.CaloriesCost),
            Quantity: food.Quantity);
    }
}