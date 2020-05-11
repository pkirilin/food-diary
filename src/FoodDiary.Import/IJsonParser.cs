using System.Collections.Generic;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Import
{
    public interface IJsonParser
    {
        IEnumerable<PageJsonItemDto> ParsePages(PagesJsonObjectDto jsonObj);

        IEnumerable<NoteJsonItemDto> ParseNotes(IEnumerable<PageJsonItemDto> pagesFromJson);

        IEnumerable<string> ParseProducts(IEnumerable<NoteJsonItemDto> notesFromJson);

        IEnumerable<string> ParseCategories(IEnumerable<NoteJsonItemDto> notesFromJson);
    }
}
