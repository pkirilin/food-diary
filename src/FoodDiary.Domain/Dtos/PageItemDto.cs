using System;

namespace FoodDiary.Domain.Dtos
{
    public class PageItemDto
    {
        public int Id { get; set; }

        public string Date { get; set; }

        public int CountNotes { get; set; }

        public int CountCalories { get; set; }
    }
}
