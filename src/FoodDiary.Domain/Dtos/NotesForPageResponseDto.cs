using System.Collections.Generic;

namespace FoodDiary.Domain.Dtos
{
    public class NotesForPageResponseDto
    {
        public int PageId { get; set; }

        public string Date { get; set; }

        public IEnumerable<MealItemDto> Meals { get; set; }
    }
}
