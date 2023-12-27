using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
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
        var expectedNotesList = notesAsString
            .Select(text => _existingNotes[text])
            .Select(n => n.ToNoteItemDto());

        _notesList.Should()
            .BeEquivalentTo(expectedNotesList, options => options
                .Excluding(note => note.Id)
                .Excluding(note => note.PageId)
                .Excluding(note => note.ProductId)
                .Excluding(note => note.Calories))
            .And.AllSatisfy(note => { note.Calories.Should().BePositive(); });
        
        return Task.CompletedTask;
    }
}