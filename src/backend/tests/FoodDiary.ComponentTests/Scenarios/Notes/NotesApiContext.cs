using System.Net;
using System.Net.Http.Json;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Notes.Recognize;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.Domain.Entities;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

public class NotesApiContext(FoodDiaryWebApplicationFactory factory, InfrastructureFixture infrastructure)
    : BaseContext(factory, infrastructure)
{
    private IReadOnlyList<NoteItemDto>? _notesList;
    private HttpResponseMessage _createNoteResponse = null!;
    private HttpResponseMessage _updateNoteResponse = null!;
    private HttpResponseMessage _deleteNoteResponse = null!;
    private HttpResponseMessage _recognizeNoteResponse = null!;

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

    public Task Given_OpenAI_api_is_ready()
    {
        return Infrastructure.ExternalServices.OpenAiApi.Start();
    }
    
    public Task Given_OpenAI_api_can_recognize_notes(params RecognizeNoteItem[] notes)
    {
        return Infrastructure.ExternalServices.OpenAiApi.SetupNotesRecognized(notes);
    }

    public async Task When_user_retrieves_notes_list_for_page(Page page)
    {
        _notesList = await ApiClient.GetFromJsonAsync<IReadOnlyList<NoteItemDto>>($"/api/v1/notes?pageId={page.Id}");
    }

    public async Task When_user_creates_note(Note note)
    {
        var request = Create.NoteCreateEditRequest()
            .From(note)
            .Please();
        _createNoteResponse = await ApiClient.PostAsJsonAsync("/api/v1/notes", request);
    }
    
    public async Task When_user_updates_product_with_quantity_for_note(Note note, Product product, int quantity)
    {
        var request = Create.NoteCreateEditRequest()
            .From(note)
            .WithProduct(product)
            .WithProductQuantity(quantity)
            .Please();
        _updateNoteResponse = await ApiClient.PutAsJsonAsync($"/api/v1/notes/{note.Id}", request);
    }

    public async Task When_user_deletes_note(Note note)
    {
        _deleteNoteResponse = await ApiClient.DeleteAsync($"/api/v1/notes/{note.Id}");
    }

    public async Task When_user_uploads_file_for_note_recognition(string file)
    {
        var filePath = Path.Combine("Scenarios", "Notes", file);
        await using var stream = File.OpenRead(filePath);
        using var content = new MultipartFormDataContent();
        content.Add(new StreamContent(stream) { Headers = { { "Content-Type", "image/png" } } }, "files", file);
        
        var request = new HttpRequestMessage
        {
            Method = HttpMethod.Post,
            RequestUri = new Uri("/api/v1/notes/recognitions", UriKind.Relative),
            Content = content
        };
        
        _recognizeNoteResponse = await ApiClient.SendAsync(request);
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
    
    public Task Then_notes_list_contains_no_items()
    {
        _notesList.Should().BeEmpty();
        return Task.CompletedTask;
    }

    public Task Then_note_is_successfully_created()
    {
        _createNoteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_note_is_successfully_updated()
    {
        _updateNoteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }
    
    public Task Then_note_is_successfully_deleted()
    {
        _deleteNoteResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        return Task.CompletedTask;
    }

    public async Task Then_note_is_successfully_recognized_as(RecognizeNoteItem note)
    {
        var response = await _recognizeNoteResponse.Content.ReadFromJsonAsync<RecognizeNoteResponse.Success>();
        response?.Notes.Should().Contain(note);
    }
}