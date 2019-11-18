using System.Collections.Generic;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class MealItemDto
    {
        public string Name { get; set; }

        public MealType Type { get; set; }

        public int CountNotes { get; set; }

        public int CountCalories { get; set; }

        public IEnumerable<NoteItemDto> Notes { get; set; }
    }
}
