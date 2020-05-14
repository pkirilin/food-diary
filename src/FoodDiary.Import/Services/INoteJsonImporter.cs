using FoodDiary.Domain.Entities;
using FoodDiary.Import.Models;

namespace FoodDiary.Import.Services
{
    interface INoteJsonImporter
    {
        Note ImportNote(NoteJsonItem noteFromJson);
    }
}
