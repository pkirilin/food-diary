namespace FoodDiary.ComponentTests.Dsl;

public static class Create
{
    public static CategoryBuilder Category(string? name = null) => new(name);
    public static PageBuilder Page(string? date = null) => new(date);
    public static PagesListBuilder PagesList(int count) => new(count);
    public static ProductBuilder Product(string? name = null) => new(name);
    public static NoteBuilder Note() => new();

    public static ProductCreateEditRequestBuilder ProductCreateEditRequest() => new();
    public static NoteCreateEditRequestBuilder NoteCreateEditRequest() => new();
}