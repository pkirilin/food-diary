using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class PageFilterDto
    {
        public SortOrder SortOrder { get; set; } = SortOrder.Descending;

        public int? ShowCount { get; set; }
    }
}
