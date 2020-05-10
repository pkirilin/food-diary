using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Services
{
    interface INoteJsonImporter
    {
        Note ImportNote(NoteJsonItemDto noteFromJson);
    }
}
