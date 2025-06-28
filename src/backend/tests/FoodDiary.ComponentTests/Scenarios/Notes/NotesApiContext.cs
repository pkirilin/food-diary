using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Notes.Recognize;
using FoodDiary.ComponentTests.Dsl;
using FoodDiary.ComponentTests.Infrastructure;
using FoodDiary.ComponentTests.Infrastructure.ExternalServices;
using FoodDiary.Contracts.Notes;
using FoodDiary.Domain.Entities;
using JetBrains.Annotations;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.ComponentTests.Scenarios.Notes;

[UsedImplicitly]
public class NotesApiContext(
    FoodDiaryWebApplicationFactory factory,
    ExternalServicesFixture externalServices) : BaseContext(factory)
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private OpenAIApi OpenAiApi => externalServices.OpenAiApi;
    private GetNotesResponse? _getNotesResponse;
    private GetNotesHistoryResponse? _getNotesHistoryResponse;
    private HttpResponseMessage _createNoteResponse = null!;
    private HttpResponseMessage _updateNoteResponse = null!;
    private HttpResponseMessage _deleteNoteResponse = null!;
    private HttpResponseMessage _recognizeNoteResponse = null!;

    public Task Given_notes(params Note[] notes)
    {
        return Factory.SeedDataAsync(notes);
    }

    public Task Given_product(Product product)
    {
        return Factory.SeedDataAsync([product]);
    }

    public Task Given_OpenAI_api_is_ready()
    {
        return OpenAiApi.Start();
    }
    
    public Task Given_OpenAI_api_can_recognize_food(FoodItemOnTheImage food)
    {
        var content = JsonSerializer.Serialize(food, SerializerOptions);
        return OpenAiApi.SetupCompletionSuccess(content);
    }
    
    public Task Given_OpenAI_completion_response_is_not_recognized_notes_json()
    {
        return OpenAiApi.SetupCompletionSuccess("Sorry, I didn't understand that.");
    }
    
    public Task Given_OpenAI_request_failed_with_error(HttpStatusCode error)
    {
        return OpenAiApi.SetupCompletionFailure(error);
    }

    public async Task When_user_retrieves_notes_list_for_date(string date)
    {
        _getNotesResponse = await ApiClient.GetFromJsonAsync<GetNotesResponse>($"/api/v1/notes?date={date}");
    }
    
    public async Task When_user_retrieves_notes_history(string from, string to)
    {
        _getNotesHistoryResponse = await ApiClient
            .GetFromJsonAsync<GetNotesHistoryResponse>($"/api/v1/notes/history?from={from}&to={to}");
    }

    public async Task When_user_creates_note(Note note)
    {
        var body = Create.NoteRequestBody()
            .From(note)
            .Please();
        
        _createNoteResponse = await ApiClient.PostAsJsonAsync("/api/v1/notes", body);
    }
    
    public async Task When_user_updates_product_with_quantity_for_note(Note note, Product product, int quantity)
    {
        var body = Create.NoteRequestBody()
            .From(note)
            .WithProduct(product)
            .WithProductQuantity(quantity)
            .Please();
        
        _updateNoteResponse = await ApiClient.PutAsJsonAsync($"/api/v1/notes/{note.Id}", body);
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
        var expectedNotesList = items.Select(n => n.ToGetNotesResponse());

        _getNotesResponse?.Notes.Should()
            .BeEquivalentTo(expectedNotesList, options => options
                .Excluding(note => note.Id))
            .And.AllSatisfy(note => { note.Product.Calories.Should().BePositive(); })
            .And.BeInAscendingOrder(note => note.MealType)
            .And.ThenBeInAscendingOrder(note => note.DisplayOrder);
        
        return Task.CompletedTask;
    }
    
    public Task Then_notes_list_contains_no_items()
    {
        _getNotesResponse?.Notes.Should().BeEmpty();
        return Task.CompletedTask;
    }
    
    public Task Then_notes_history_contains_items(params NotesHistoryItem[] items)
    {
        _getNotesHistoryResponse?.NotesHistory.Should().BeEquivalentTo(items);
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
    
    public async Task Then_note_is_successfully_recognized_as(Product product, int quantity)
    {
        var response = await _recognizeNoteResponse.Content.ReadFromJsonAsync<RecognizeNoteResponse>();
        var recognizedNote = response?.Notes[0];

        recognizedNote.Should().NotBeNull();
        recognizedNote!.Quantity.Should().Be(quantity);
        recognizedNote.Product.Name.Should().Be(product.Name);
        recognizedNote.Product.CaloriesCost.Should().Be(product.CaloriesCost);
        recognizedNote.Product.Protein.Should().Be(product.Protein);
        recognizedNote.Product.Fats.Should().Be(product.Fats);
        recognizedNote.Product.Carbs.Should().Be(product.Carbs);
        recognizedNote.Product.Sugar.Should().Be(product.Sugar);
        recognizedNote.Product.Salt.Should().Be(product.Salt);
    }

    public async Task Then_recognize_note_response_returns_error(HttpStatusCode statusCode)
    {
        _recognizeNoteResponse.StatusCode.Should().Be(statusCode);
        var response = await _recognizeNoteResponse.Content.ReadFromJsonAsync<ProblemDetails>();
        response!.Title.Should().NotBeNullOrWhiteSpace();
        response.Detail.Should().NotBeNullOrWhiteSpace();
    }
}