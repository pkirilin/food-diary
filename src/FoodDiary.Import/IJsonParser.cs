using System.Collections.Generic;
using FoodDiary.Import.Models;

namespace FoodDiary.Import
{
    public interface IJsonParser
    {
        IEnumerable<PageJsonItem> ParsePages(PagesJsonObject jsonObj);

        IEnumerable<NoteJsonItem> ParseNotes(IEnumerable<PageJsonItem> pagesFromJson);

        IEnumerable<string> ParseProducts(IEnumerable<NoteJsonItem> notesFromJson);

        IEnumerable<string> ParseCategories(IEnumerable<NoteJsonItem> notesFromJson);
    }
}
