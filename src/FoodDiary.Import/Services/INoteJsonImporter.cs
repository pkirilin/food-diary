using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.Import.Services
{
    interface INoteJsonImporter
    {
        /// <summary>
        /// Creates note from JSON
        /// </summary>
        /// <returns>Imported note entity</returns>
        Note ImportNote(NoteJsonItem noteFromJson);
    }
}
