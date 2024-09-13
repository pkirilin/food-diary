using FoodDiary.Contracts.Notes;

namespace FoodDiary.ComponentTests.Dsl;

public static class Create
{
    public static CategoryBuilder Category(string? name = null) => new(name);
    public static ProductBuilder Product(string? name = null) => new(name);
    public static NoteBuilder Note() => new();
    
    public static RecognizeNoteItemBuilder RecognizeNoteItem() => new();
    
    public static NotesHistoryItem NoteHistoryItem(string date, int caloriesCount) => new(
        DateOnly.Parse(date),
        caloriesCount);

    public static ProductCreateEditRequestBuilder ProductCreateEditRequest() => new();
    public static NoteRequestBodyBuilder NoteRequestBody() => new();
}