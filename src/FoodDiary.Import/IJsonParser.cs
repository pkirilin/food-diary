using System.Collections.Generic;
using FoodDiary.Domain.Dtos;

namespace FoodDiary.Import
{
    public interface IJsonParser
    {
        IEnumerable<PageJsonItemDto> ParsePages(PagesJsonExportDto jsonObj);

        IEnumerable<NoteJsonItemDto> ParseNotes(IEnumerable<PageJsonItemDto> pagesFromJson);

        IEnumerable<string> ParseProductNames(IEnumerable<NoteJsonItemDto> notesFromJson);

        IEnumerable<string> ParseCategoryNames(IEnumerable<NoteJsonItemDto> notesFromJson);
    }
}
