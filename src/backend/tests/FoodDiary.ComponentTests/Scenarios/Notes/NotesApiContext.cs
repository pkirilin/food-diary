using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiContext : BaseContext
{
    private IReadOnlyList<NoteItemDto>? _notesList;
    private HttpResponseMessage _createNoteResponse = null!;
    
    public NotesApiContext(FoodDiaryWebApplicationFactory factory) : base(factory)
    {
    }
    
    public Task Given_notes(params Note[] notes)
    {
        return Factory.SeedDataAsync(notes);
    }
    
    public Task Given_page(Page page)
    {
        return Factory.SeedDataAsync(new[] { page });
    }
    
    public Task Given_product(Product product)
    {
        return Factory.SeedDataAsync(new[] { product });
    }

    public async Task When_user_retrieves_notes_list_for_page(Page page)
    {
        _notesList = await ApiClient.GetFromJsonAsync<IReadOnlyList<NoteItemDto>>($"/api/v1/notes?pageId={page.Id}");
    }

    public async Task When_user_creates_note(Note note)
    {
        var request = note.ToNoteCreateEditRequest();
        request.ProductId = note.Product.Id;
        request.PageId = note.Page.Id;
        _createNoteResponse = await ApiClient.PostAsJsonAsync("/api/v1/notes", request);
    }

    public Task Then_notes_list_contains_items(params Note[] items)
    {
        var expectedNotesList = items.Select(n => n.ToNoteItemDto());

        _notesList.Should()
            .BeEquivalentTo(expectedNotesList, options => options
                .Excluding(note => note.Id)
                .Excluding(note => note.PageId)
                .Excluding(note => note.ProductId)
                .Excluding(note => note.Calories))
            .And.AllSatisfy(note => { note.Calories.Should().BePositive(); });
        
        return Task.CompletedTask;
    }

    public Task Then_note_is_successfully_created()
    {
        _createNoteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
}