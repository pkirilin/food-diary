namespace FoodDiary.ComponentTests.Dsl;

public static class Create
{
    public static CategoryBuilder Category(string? name = null) => new(name);
    public static PageBuilder Page(string date) => new(date);
    public static ProductBuilder Product(string name) => new(name);
    public static NoteBuilder Note() => new();

    public static NoteCreateEditRequestBuilder NoteCreateEditRequest() => new();
}