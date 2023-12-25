using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiContext : BaseContext
{
    private readonly Dictionary<string, Note> _existingNotes = new();

    private IReadOnlyList<NoteItemDto>? _notesList;
    
    public NotesApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }
    
    public Task Given_notes(params string[] notesAsString)
    {
        var notesByTextRepresentation = notesAsString
            .Select(n => (Text: n, ParsedNote: NoteAsString.Parse(n)))
            .ToDictionary(pair => pair.Text, pair => pair.ParsedNote);

        foreach (var (key, value) in notesByTextRepresentation)
        {
            _existingNotes.Add(key, value);
        }
        
        return Factory.SeedDataAsync(notesByTextRepresentation.Values);
    }

    public async Task When_user_retrieves_notes_list()
    {
        var testPageId = NoteAsString.TestPage.Id;
        
        _notesList = await ApiClient
            .GetFromJsonAsync<IReadOnlyList<NoteItemDto>>($"/api/v1/notes?pageId={testPageId}");
    }

    public Task Then_notes_list_contains(params string[] notesAsString)
    {
        notesAsString
            .Select(text => _existingNotes[text])
            .ToList()
            .ForEach(expected =>
            {
                _notesList.Should().Contain(actual =>
                    actual.MealType == expected.MealType &&
                    actual.ProductName == expected.Product.Name &&
                    actual.ProductQuantity == expected.ProductQuantity &&
                    actual.DisplayOrder == expected.DisplayOrder &&
                    actual.Calories > 0);
            });
        
        return Task.CompletedTask;
    }
}