using System.Collections.Generic;

namespace FoodDiary.IntegrationTests.Fakes;

public class FakeGoogleDocument
{
    public string Id { get; init; } = "";

    public string Title { get; init; } = "";

    public List<string> Headers { get; } = new();

    public List<string[][]> Tables { get; } = new();

    public void RenderHeader(string text)
    {
        Headers.Add(text);
    }

    public void RenderTable(string[][] cells)
    {
        Tables.Add(cells);
    }
}